// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   CheckCircle2,
//   Clock3,
//   FileText,
//   ShieldCheck,
// } from "lucide-react";

// export default function OwnershipPage() {
//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     try {
//       const savedProperty = sessionStorage.getItem("selectedProperty");

//       if (savedProperty) {
//         setProperty(JSON.parse(savedProperty));
//       }
//     } catch (error) {
//       console.error("Unable to load selected property:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   /*
//    * ---------------------------------------------------------
//    * LOADING STATE
//    * ---------------------------------------------------------
//    */

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-[#0b0b0b] text-white">
//         <div className="flex min-h-screen items-center justify-center">
//           <div className="flex items-center gap-4 text-white/50">
//             <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
//             <span>Loading ownership records...</span>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   /*
//    * ---------------------------------------------------------
//    * NO PROPERTY SELECTED
//    * ---------------------------------------------------------
//    */

//   if (!property) {
//     return (
//       <main className="min-h-screen bg-[#0b0b0b] text-white">
//         {/* Background */}
//         <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
//           <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

//           <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
//         </div>

//         <section className="px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
//           <div className="mx-auto max-w-[1400px]">
//             <Link
//               href="/property-search"
//               className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
//             >
//               <ArrowLeft size={16} />
//               Back to Property Search
//             </Link>

//             <p className="mt-20 text-xs font-semibold tracking-[0.35em] text-white/35">
//               OWNERSHIP / LAND REGISTRY
//             </p>

//             <h1 className="mt-7 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-light leading-[0.9] tracking-[-0.05em]">
//               No property
//               <br />
//               <span className="text-white/35">selected.</span>
//             </h1>

//             <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45">
//               Select and validate a property from the Property Search page
//               before viewing ownership and land registry information.
//             </p>

//             <Link
//               href="/property-search"
//               className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium transition duration-300 hover:bg-white hover:text-black"
//             >
//               Go to Property Search
//               <span>↗</span>
//             </Link>
//           </div>
//         </section>

//         <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
//           <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
//             <span>PROP DUE</span>
//             <span>PROPERTY DUE DILIGENCE PLATFORM</span>
//           </div>
//         </footer>
//       </main>
//     );
//   }

//   /*
//    * ---------------------------------------------------------
//    * OWNERSHIP PAGE
//    * ---------------------------------------------------------
//    */

//   return (
//     <main className="min-h-screen bg-[#0b0b0b] text-white">
//       {/* Background */}
//       <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
//         <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

//         <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
//       </div>

//       {/* =====================================================
//           HEADER
//           ===================================================== */}

//       <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <Link
//             href="/property-search"
//             className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
//           >
//             <ArrowLeft size={16} />
//             Property Search
//           </Link>

//           <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
//             OWNERSHIP / LAND REGISTRY
//           </p>

//           <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
//             Verify
//             <br />
//             <span className="text-white/35">ownership.</span>
//           </h1>

//           <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
//             Review recorded ownership information, parcel details, and
//             registry records for the selected property.
//           </p>
//         </div>
//       </section>

//       {/* =====================================================
//           PROPERTY OVERVIEW
//           ===================================================== */}

//       <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <div className="flex items-center gap-3">
//             <CheckCircle2 size={18} className="text-emerald-400" />

//             <span className="text-xs font-semibold tracking-[0.3em] text-emerald-400/70">
//               PROPERTY SELECTED
//             </span>
//           </div>

//           <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
//             {property.formattedAddress || "Property Address"}
//           </h2>

//           <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
//             <DetailCard label="City" value={property.city || "—"} />

//             <DetailCard label="State" value={property.state || "—"} />

//             <DetailCard
//               label="Postal Code"
//               value={property.postalCode || "—"}
//             />

//             <DetailCard
//               label="Property ID"
//               value={property.propertyId || "Not available"}
//             />
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           OWNERSHIP VERIFICATION
//           ===================================================== */}

//       <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
//             OWNERSHIP VERIFICATION
//           </p>

//           <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
//             {/* Status */}
//             <div className="bg-[#101010] p-8 md:p-10">
//               <div className="flex items-center gap-3">
//                 <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.04]">
//                   <ShieldCheck size={20} className="text-emerald-400" />
//                 </span>

//                 <div>
//                   <p className="text-xs tracking-[0.25em] text-white/25">
//                     RECORD STATUS
//                   </p>

//                   <p className="mt-2 text-lg text-emerald-400/80">
//                     Ready for verification
//                   </p>
//                 </div>
//               </div>

//               <p className="mt-8 max-w-xl text-sm leading-7 text-white/40">
//                 Ownership information will be retrieved from the configured
//                 land registry or public property record service.
//               </p>
//             </div>

//             {/* Ownership Type */}
//             <div className="bg-[#101010] p-8 md:p-10">
//               <p className="text-xs tracking-[0.25em] text-white/25">
//                 OWNERSHIP TYPE
//               </p>

//               <p className="mt-5 text-2xl font-light text-white/80">
//                 Awaiting registry data
//               </p>

//               <p className="mt-3 text-sm leading-6 text-white/35">
//                 The actual ownership type will appear here after backend
//                 integration.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           CURRENT OWNER
//           ===================================================== */}

//       <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
//             CURRENT OWNER
//           </p>

//           <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
//             <div className="grid gap-10 md:grid-cols-2">
//               <div>
//                 <p className="text-xs tracking-[0.25em] text-white/25">
//                   OWNER NAME
//                 </p>

//                 <p className="mt-4 text-3xl font-light text-white/75">
//                   Ownership data pending
//                 </p>

//                 <p className="mt-4 text-sm leading-7 text-white/35">
//                   The registered owner will be displayed here once the
//                   ownership service is connected.
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs tracking-[0.25em] text-white/25">
//                   RECORD SOURCE
//                 </p>

//                 <p className="mt-4 text-lg text-white/60">
//                   Public Land Registry
//                 </p>

//                 <p className="mt-3 text-sm leading-7 text-white/35">
//                   Source information will be populated by the backend
//                   ownership service.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           PARCEL INFORMATION
//           ===================================================== */}

//       <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
//             PARCEL INFORMATION
//           </p>

//           <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
//             <DetailCard label="Parcel Number" value="Pending" />

//             <DetailCard label="County" value="Pending" />

//             <DetailCard label="Land Area" value="Pending" />

//             <DetailCard label="Record Date" value="Pending" />
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           REGISTRY DETAILS
//           ===================================================== */}

//       <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
//             REGISTRY DETAILS
//           </p>

//           <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
//             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//               <RegistryItem
//                 icon={<FileText size={18} />}
//                 label="Registry Source"
//                 value="Pending backend integration"
//               />

//               <RegistryItem
//                 icon={<Clock3 size={18} />}
//                 label="Last Updated"
//                 value="Not available"
//               />

//               <RegistryItem
//                 icon={<ShieldCheck size={18} />}
//                 label="Verification"
//                 value="Pending"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           OWNERSHIP TIMELINE
//           ===================================================== */}

//       <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto max-w-[1400px]">
//           <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
//             OWNERSHIP TIMELINE
//           </p>

//           <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
//             <div className="relative border-l border-white/10 pl-8">
//               <TimelineItem
//                 year="CURRENT"
//                 title="Current ownership record"
//                 text="Ownership history will appear here after registry integration."
//               />

//               <TimelineItem
//                 year="PREVIOUS"
//                 title="Previous ownership record"
//                 text="Historical ownership records will be displayed here."
//               />

//               <TimelineItem
//                 year="HISTORICAL"
//                 title="Earlier ownership record"
//                 text="Additional historical records can be added by the backend."
//                 last
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           FOOTER
//           ===================================================== */}

//       <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
//         <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
//           <span>PROP DUE</span>
//           <span>OWNERSHIP & LAND REGISTRY</span>
//         </div>
//       </footer>
//     </main>
//   );
// }

// /*
//  * =========================================================
//  * DETAIL CARD
//  * =========================================================
//  */

// function DetailCard({ label, value }) {
//   return (
//     <div className="bg-[#101010] p-6">
//       <p className="text-xs tracking-[0.2em] text-white/25">
//         {label}
//       </p>

//       <p className="mt-4 break-words text-base font-medium text-white/80">
//         {value}
//       </p>
//     </div>
//   );
// }

// /*
//  * =========================================================
//  * REGISTRY ITEM
//  * =========================================================
//  */

// function RegistryItem({ icon, label, value }) {
//   return (
//     <div>
//       <div className="flex items-center gap-3 text-white/40">
//         {icon}

//         <p className="text-xs tracking-[0.2em]">
//           {label}
//         </p>
//       </div>

//       <p className="mt-4 text-sm text-white/65">
//         {value}
//       </p>
//     </div>
//   );
// }

// /*
//  * =========================================================
//  * TIMELINE ITEM
//  * =========================================================
//  */

// function TimelineItem({ year, title, text, last = false }) {
//   return (
//     <div className={`relative ${last ? "" : "pb-12"}`}>
//       <span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-[#0b0b0b]" />

//       <p className="text-xs tracking-[0.25em] text-white/25">
//         {year}
//       </p>

//       <h3 className="mt-3 text-xl font-light text-white/75">
//         {title}
//       </h3>

//       <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
//         {text}
//       </p>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| DEFAULT PROPERTY
|--------------------------------------------------------------------------
| Used when the page is opened directly without a selected property.
|--------------------------------------------------------------------------
*/
const DEFAULT_PROPERTY = {
  formattedAddress: "742 Evergreen Terrace, Springfield, IL 62704",
  address: "742 Evergreen Terrace, Springfield, IL 62704",
  city: "Springfield",
  state: "Illinois",
  postalCode: "62704",
  propertyId: "PROP-742-001",
  latitude: 39.7817,
  longitude: -89.6501,
};

/*
|--------------------------------------------------------------------------
| DEMO OWNERSHIP DATA
|--------------------------------------------------------------------------
| Temporary frontend data.
| Later this will come from the backend ownership API.
|--------------------------------------------------------------------------
*/
const DEMO_OWNERSHIP_DATA = {
  ownerName: "Robert Anderson",
  ownershipType: "Individual Ownership",
  recordStatus: "Verified",
  registrySource: "County Public Land Registry",
  lastUpdated: "September 18, 2026",
  verificationStatus: "Verified",

  parcelNumber: "SPR-742-00981",
  county: "Sangamon County",
  landArea: "0.24 acres",
  recordDate: "June 14, 2019",

  deedNumber: "2019-004827",
  deedType: "Warranty Deed",
  recordingDate: "June 18, 2019",

  timeline: [
    {
      year: "2019",
      title: "Current owner recorded",
      text: "Robert Anderson was recorded as the current property owner through a warranty deed.",
    },
    {
      year: "2012",
      title: "Previous ownership record",
      text: "The property was previously recorded under Michael Anderson.",
    },
    {
      year: "2005",
      title: "Earlier ownership record",
      text: "Historical registry records indicate a previous transfer of the property.",
    },
  ],
};

export default function OwnershipPage() {
  const [property, setProperty] = useState(DEFAULT_PROPERTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedProperty =
        sessionStorage.getItem("selectedProperty");

      if (savedProperty) {
        const parsedProperty = JSON.parse(savedProperty);

        setProperty({
          ...DEFAULT_PROPERTY,
          ...parsedProperty,
        });
      }
    } catch (error) {
      console.error(
        "Unable to load selected property. Using demo property.",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
            <span>Loading ownership records...</span>
          </div>
        </div>
      </main>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

        <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />
      </div>

      {/* Hero */}
      <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/property-search"
            className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Property Search
          </Link>

          <p className="mb-7 mt-16 text-xs font-semibold tracking-[0.35em] text-white/35">
            OWNERSHIP / LAND REGISTRY
          </p>

          <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">
            Verify
            <br />

            <span className="text-white/35">ownership.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
            Review ownership information, parcel details, registry records,
            and historical ownership data for the selected property.
          </p>

          {/* Demo indicator */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.04] px-4 py-2 text-xs text-yellow-300/70">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />

            DEMO DATA — BACKEND INTEGRATION PENDING
          </div>
        </div>
      </section>

      {/* Selected Property */}
      <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            <span className="text-xs font-semibold tracking-[0.3em] text-emerald-400/70">
              PROPERTY SELECTED
            </span>
          </div>

          <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
            {property.formattedAddress}
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              label="City"
              value={property.city || "Springfield"}
            />

            <DetailCard
              label="State"
              value={property.state || "Illinois"}
            />

            <DetailCard
              label="Postal Code"
              value={property.postalCode || "62704"}
            />

            <DetailCard
              label="Property ID"
              value={property.propertyId || "PROP-742-001"}
            />
          </div>
        </div>
      </section>

      {/* Ownership Verification */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            OWNERSHIP VERIFICATION
          </p>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {/* Record Status */}
            <div className="bg-[#101010] p-8 md:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.04]">
                  <ShieldCheck
                    size={20}
                    className="text-emerald-400"
                  />
                </span>

                <div>
                  <p className="text-xs tracking-[0.25em] text-white/25">
                    RECORD STATUS
                  </p>

                  <p className="mt-2 text-lg text-emerald-400/80">
                    {DEMO_OWNERSHIP_DATA.recordStatus}
                  </p>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-white/40">
                The ownership record has been matched against the configured
                public land registry data source.
              </p>
            </div>

            {/* Ownership Type */}
            <div className="bg-[#101010] p-8 md:p-10">
              <p className="text-xs tracking-[0.25em] text-white/25">
                OWNERSHIP TYPE
              </p>

              <p className="mt-5 text-2xl font-light text-white/80">
                {DEMO_OWNERSHIP_DATA.ownershipType}
              </p>

              <p className="mt-3 text-sm leading-6 text-white/35">
                The current record indicates individual ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Owner */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            CURRENT OWNER
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Owner */}
              <div>
                <div className="flex items-center gap-3">
                  <UserRound
                    size={20}
                    className="text-white/40"
                  />

                  <p className="text-xs tracking-[0.25em] text-white/25">
                    OWNER NAME
                  </p>
                </div>

                <p className="mt-5 text-3xl font-light text-white/80">
                  {DEMO_OWNERSHIP_DATA.ownerName}
                </p>

                <p className="mt-4 text-sm leading-7 text-white/35">
                  Registered individual owner associated with the current
                  property record.
                </p>
              </div>

              {/* Source */}
              <div>
                <p className="text-xs tracking-[0.25em] text-white/25">
                  RECORD SOURCE
                </p>

                <p className="mt-4 text-lg text-white/60">
                  {DEMO_OWNERSHIP_DATA.registrySource}
                </p>

                <p className="mt-3 text-sm leading-7 text-white/35">
                  This is temporary demo information for frontend testing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parcel Information */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            PARCEL INFORMATION
          </p>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              label="Parcel Number"
              value={DEMO_OWNERSHIP_DATA.parcelNumber}
            />

            <DetailCard
              label="County"
              value={DEMO_OWNERSHIP_DATA.county}
            />

            <DetailCard
              label="Land Area"
              value={DEMO_OWNERSHIP_DATA.landArea}
            />

            <DetailCard
              label="Record Date"
              value={DEMO_OWNERSHIP_DATA.recordDate}
            />
          </div>
        </div>
      </section>

      {/* Registry Details */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            REGISTRY DETAILS
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <RegistryItem
                icon={<FileText size={18} />}
                label="Registry Source"
                value={DEMO_OWNERSHIP_DATA.registrySource}
              />

              <RegistryItem
                icon={<Clock3 size={18} />}
                label="Last Updated"
                value={DEMO_OWNERSHIP_DATA.lastUpdated}
              />

              <RegistryItem
                icon={<ShieldCheck size={18} />}
                label="Verification"
                value={DEMO_OWNERSHIP_DATA.verificationStatus}
              />

              <RegistryItem
                icon={<FileText size={18} />}
                label="Deed Number"
                value={DEMO_OWNERSHIP_DATA.deedNumber}
              />

              <RegistryItem
                icon={<FileText size={18} />}
                label="Deed Type"
                value={DEMO_OWNERSHIP_DATA.deedType}
              />

              <RegistryItem
                icon={<Clock3 size={18} />}
                label="Recording Date"
                value={DEMO_OWNERSHIP_DATA.recordingDate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Property Location */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            PROPERTY LOCATION
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Coordinates */}
              <div>
                <div className="flex items-center gap-3">
                  <MapPin
                    size={20}
                    className="text-white/40"
                  />

                  <p className="text-xs tracking-[0.25em] text-white/25">
                    COORDINATES
                  </p>
                </div>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/25">
                      LATITUDE
                    </p>

                    <p className="mt-2 text-lg text-white/70">
                      {property.latitude}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/25">
                      LONGITUDE
                    </p>

                    <p className="mt-2 text-lg text-white/70">
                      {property.longitude}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div>
                <p className="text-xs tracking-[0.25em] text-white/25">
                  MAP LOCATION
                </p>

                <p className="mt-4 text-lg text-white/65">
                  {property.formattedAddress}
                </p>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black"
                >
                  Open Map
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ownership Timeline */}
      <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
            OWNERSHIP TIMELINE
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div className="relative border-l border-white/10 pl-8">
              {DEMO_OWNERSHIP_DATA.timeline.map(
                (item, index) => (
                  <TimelineItem
                    key={`${item.year}-${index}`}
                    year={item.year}
                    title={item.title}
                    text={item.text}
                    last={
                      index ===
                      DEMO_OWNERSHIP_DATA.timeline.length - 1
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Next Research Stage */}
      <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <p className="text-xs font-semibold tracking-[0.3em] text-white/25">
              NEXT RESEARCH STAGE
            </p>

            <h2 className="mt-4 text-3xl font-light text-white/80">
              Property Tax History
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
              Review historical property tax assessments, tax amounts,
              payment records, and changes across previous tax years.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {/* Tax History Button */}
              <Link
                href="/tax-history"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
              >
                View Tax History
                <ArrowRight size={16} />
              </Link>

              {/* Back to Property Search */}
              <Link
                href="/property-search"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 py-4 text-sm font-medium text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
              >
                Property Search
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
          <span>PROP DUE</span>

          <span>OWNERSHIP & LAND REGISTRY</span>
        </div>
      </footer>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Detail Card
|--------------------------------------------------------------------------
*/
function DetailCard({ label, value }) {
  return (
    <div className="bg-[#101010] p-6">
      <p className="text-xs tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-4 break-words text-base font-medium text-white/80">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Registry Item
|--------------------------------------------------------------------------
*/
function RegistryItem({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-white/40">
        {icon}

        <p className="text-xs tracking-[0.2em]">
          {label}
        </p>
      </div>

      <p className="mt-4 text-sm text-white/65">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Timeline Item
|--------------------------------------------------------------------------
*/
function TimelineItem({
  year,
  title,
  text,
  last = false,
}) {
  return (
    <div className={`relative ${last ? "" : "pb-12"}`}>
      <span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-[#0b0b0b]" />

      <p className="text-xs tracking-[0.25em] text-white/25">
        {year}
      </p>

      <h3 className="mt-3 text-xl font-light text-white/75">
        {title}
      </h3>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">
        {text}
      </p>
    </div>
  );
}