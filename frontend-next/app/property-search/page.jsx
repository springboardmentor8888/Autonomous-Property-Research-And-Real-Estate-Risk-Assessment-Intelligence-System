"use client";

import { useState } from "react";

// Backend base URL — update if deployed elsewhere.
const BASE_URL = "http://localhost:8080/api";

export default function PropertySearchPage() {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [result, setResult] = useState(null);

    async function handleSearch(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setResult(null);

        const cleanAddress = address.trim();

        // -----------------------------
        // BASIC ADDRESS VALIDATION
        // -----------------------------

        if (!cleanAddress) {
            setError("Please enter a property address.");
            return;
        }

        if (cleanAddress.length < 8) {
            setError("Please enter a complete property address.");
            return;
        }

        setLoading(true);

        try {
            // -----------------------------
            // CALL OUR BACKEND (which calls Geoapify server-side)
            // -----------------------------

            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : null;

            const response = await fetch(`${BASE_URL}/properties/validate-address`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ address: cleanAddress }),
            });

            const data = await response.json().catch(() => null);

            // -----------------------------
            // HTTP / BACKEND ERROR
            // -----------------------------

            if (!response.ok) {
                throw new Error(
                    data?.error?.message || `Request failed (${response.status})`,
                );
            }

            // -----------------------------
            // CHECK IF ADDRESS WAS ACTUALLY VALID
            // -----------------------------

            if (!data || data.valid === false) {
                throw new Error("No matching address was found.");
            }

            // -----------------------------
            // BUILD PROPERTY RESULT
            // (mapped to our backend's actual response field names)
            // -----------------------------

            const propertyResult = {
                formattedAddress: data.formattedAddress || cleanAddress,
                city: data.city || "Not available",
                state: data.state || "Not available",
                postalCode: data.postalCode || "Not available",
                country: data.country || "Not available",
                latitude: data.latitude,
                longitude: data.longitude,
                originalAddress: cleanAddress,
                rawResponse: data,
            };

            // -----------------------------
            // SAVE RESULT
            // -----------------------------

            setResult(propertyResult);

            setSuccess(
                "Address successfully validated."
            );
        } catch (searchError) {
            console.error(
                "Address validation error:",
                searchError
            );

            setError(
                searchError.message ||
                "We could not validate that address. Please check the address and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">

            {/* =========================================
                BACKGROUND
            ========================================= */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

                <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

                <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />

            </div>


            {/* =========================================
                HEADER
            ========================================= */}

            <section className="border-b border-white/10 px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto max-w-[1400px]">

                    <p className="mb-7 text-xs font-semibold tracking-[0.35em] text-white/35">
                        PROPERTY SEARCH
                    </p>

                    <h1 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em]">

                        Start with

                        <br />

                        <span className="text-white/35">
                            the address.
                        </span>

                    </h1>

                    <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/45 md:text-xl">
                        Enter a property address to validate
                        its location and begin the
                        due-diligence journey.
                    </p>

                </div>

            </section>


            {/* =========================================
                SEARCH SECTION
            ========================================= */}

            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto max-w-[1400px]">

                    <form
                        onSubmit={handleSearch}
                        className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl md:p-8"
                    >

                        {/* LABEL */}

                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <label
                                htmlFor="property-address"
                                className="text-xs font-semibold tracking-[0.3em] text-white/40"
                            >
                                PROPERTY ADDRESS
                            </label>

                            <span className="flex items-center gap-2 text-xs">

                                <span
                                    className={`h-2 w-2 rounded-full ${success
                                        ? "bg-emerald-400"
                                        : "bg-yellow-400"
                                        }`}
                                />

                                <span
                                    className={
                                        success
                                            ? "text-emerald-400/70"
                                            : "text-yellow-400/70"
                                    }
                                >
                                    {success
                                        ? "Address service ready"
                                        : "Backend Geocoding"}
                                </span>

                            </span>

                        </div>


                        {/* INPUT + BUTTON */}

                        <div className="flex flex-col gap-3 lg:flex-row">

                            <input
                                id="property-address"
                                type="text"
                                value={address}
                                onChange={(event) => {
                                    setAddress(
                                        event.target.value
                                    );

                                    setError("");
                                    setSuccess("");
                                    setResult(null);
                                }}
                                placeholder="1600 Pennsylvania Avenue NW, Washington, D.C. 20500"
                                autoComplete="street-address"
                                className="min-h-[62px] flex-1 rounded-xl border border-white/10 bg-black/30 px-5 text-base text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-black/50"
                            />


                            <button
                                type="submit"
                                disabled={loading}
                                className="min-h-[62px] rounded-xl border border-white/20 px-8 text-sm font-medium transition duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                {loading ? (

                                    <span className="flex items-center justify-center gap-3">

                                        <span className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" />

                                        Validating...

                                    </span>

                                ) : (

                                    <span className="flex items-center gap-3">

                                        Search Property

                                        <span className="text-lg">
                                            ↗
                                        </span>

                                    </span>

                                )}

                            </button>

                        </div>


                        {/* =================================
                            SUCCESS MESSAGE
                        ================================= */}

                        {success && (

                            <div className="mt-5 flex items-center gap-3 text-sm text-emerald-400">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/30">
                                    ✓
                                </span>

                                {success}

                            </div>

                        )}


                        {/* =================================
                            ERROR MESSAGE
                        ================================= */}

                        {error && (

                            <div className="mt-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-5 py-4">

                                <div className="flex items-start gap-3">

                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/40 text-xs text-red-400">
                                        !
                                    </span>

                                    <p className="text-sm leading-6 text-red-300/80">
                                        {error}
                                    </p>

                                </div>

                            </div>

                        )}

                    </form>

                </div>

            </section>


            {/* =========================================
                EMPTY STATE
            ========================================= */}

            {!result && !loading && (

                <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">

                            <InfoBlock
                                number="01"
                                title="Enter an address"
                                text="Start with the full address of the property you want to research."
                            />

                            <InfoBlock
                                number="02"
                                title="Validate location"
                                text="The address is resolved through our backend's geocoding service."
                            />

                            <InfoBlock
                                number="03"
                                title="Begin due diligence"
                                text="Use the validated location as the starting point for the next research stages."
                            />

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                LOADING
            ========================================= */}

            {loading && (

                <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        <div className="border-t border-white/10 pt-16">

                            <div className="flex items-center gap-5">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">

                                    <div className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" />

                                </div>

                                <div>

                                    <p className="text-lg font-light text-white/70">
                                        Validating property address...
                                    </p>

                                    <p className="mt-1 text-sm text-white/30">
                                        Resolving the address through our backend.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                RESULT
            ========================================= */}

            {result && (

                <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

                        {/* VALIDATED HEADER */}

                        <div className="border-t border-white/10 pt-16">

                            <div className="flex items-center gap-3">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/30 text-xs text-emerald-400">
                                    ✓
                                </span>

                                <span className="text-xs font-semibold tracking-[0.3em] text-emerald-400/70">
                                    ADDRESS VALIDATED
                                </span>

                            </div>


                            <h2 className="mt-6 max-w-5xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
                                {result.formattedAddress}
                            </h2>

                        </div>


                        {/* =================================
                            LOCATION DETAILS
                        ================================= */}

                        <div className="mt-16">

                            <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                LOCATION DETAILS
                            </p>


                            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">

                                <DetailCard
                                    label="City"
                                    value={result.city}
                                />

                                <DetailCard
                                    label="State"
                                    value={result.state}
                                />

                                <DetailCard
                                    label="Postal Code"
                                    value={result.postalCode}
                                />

                                <DetailCard
                                    label="Country"
                                    value={result.country}
                                />

                            </div>


                            {/* =================================
                                COORDINATES
                            ================================= */}

                            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    COORDINATES
                                </p>

                                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">

                                    <div>

                                        <p className="text-sm text-white/30">
                                            Latitude
                                        </p>

                                        <p className="mt-2 text-lg text-white/80">
                                            {result.latitude?.toFixed(6)}
                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-white/30">
                                            Longitude
                                        </p>

                                        <p className="mt-2 text-lg text-white/80">
                                            {result.longitude?.toFixed(6)}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                MAP
                            ================================= */}

                            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

                                <p className="text-xs tracking-[0.25em] text-white/25">
                                    LOCATION
                                </p>

                                <p className="mt-4 text-sm leading-6 text-white/40">
                                    The address was successfully
                                    converted into geographic
                                    coordinates.
                                </p>

                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=18/${result.latitude}/${result.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm transition hover:bg-white hover:text-black"
                                >
                                    Open Location on Map
                                    <span>↗</span>
                                </a>

                            </div>




                            {/* =================================
                                NEXT STEP
                            ================================= */}

                            <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">

                                <div>

                                    <p className="text-xs font-semibold tracking-[0.3em] text-white/25">
                                        NEXT STEP
                                    </p>

                                    <p className="mt-3 text-xl font-light text-white/70">
                                        Continue to property details
                                        and due diligence.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-4 text-sm font-medium transition duration-300 hover:bg-white hover:text-black"
                                    onClick={() =>
                                        alert(
                                            "Property details module will be connected next."
                                        )
                                    }
                                >
                                    View Property Details
                                    <span>↗</span>
                                </button>

                            </div>



                        </div>

                    </div>

                </section>

            )}


            {/* =========================================
                FOOTER
            ========================================= */}

            <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">

                    <span>PROP DUE</span>

                    <span>
                        PROPERTY DUE DILIGENCE PLATFORM
                    </span>

                </div>

            </footer>

        </main>
    );
}


/*
|--------------------------------------------------------------------------
| INFO BLOCK
|--------------------------------------------------------------------------
*/

function InfoBlock({
    number,
    title,
    text,
}) {
    return (
        <div className="bg-[#101010] p-8 md:p-10">

            <p className="text-xs tracking-[0.25em] text-white/25">
                {number}
            </p>

            <h3 className="mt-12 text-2xl font-medium">
                {title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/40">
                {text}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DETAIL CARD
|--------------------------------------------------------------------------
*/

function DetailCard({
    label,
    value,
}) {
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