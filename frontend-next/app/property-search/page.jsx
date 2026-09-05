"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = "";

export default function PropertySearchPage() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geocoderRef = useRef(null);
    const markerRef = useRef(null);

    const [mapsReady, setMapsReady] = useState(false);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [result, setResult] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | LOAD GOOGLE MAPS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        const initializeGoogleMaps = () => {
            if (cancelled) return;

            if (!window.google?.maps) {
                setError("Google Maps failed to load.");
                return;
            }

            if (!window.google.maps.Geocoder) {
                setError(
                    "Google Maps loaded, but Geocoding is unavailable. Make sure the Geocoding API is enabled."
                );
                return;
            }

            geocoderRef.current =
                new window.google.maps.Geocoder();

            setMapsReady(true);
            setError("");

            console.log(
                "Google Maps and Geocoder loaded successfully."
            );
        };

        if (
            !GOOGLE_MAPS_API_KEY ||
            GOOGLE_MAPS_API_KEY ===
            "YOUR_API_KEY_HERE"
        ) {
            setError(
                "Please add your Google Maps API key in page.jsx."
            );

            return () => {
                cancelled = true;
            };
        }

        /*
        |--------------------------------------------------------------------------
        | If Google Maps is already available
        |--------------------------------------------------------------------------
        */

        if (
            window.google?.maps &&
            window.google.maps.Geocoder
        ) {
            initializeGoogleMaps();

            return () => {
                cancelled = true;
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Remove our previous script if HMR left it behind
        |--------------------------------------------------------------------------
        */

        const oldScript = document.getElementById(
            "propdue-google-maps"
        );

        if (oldScript) {
            oldScript.remove();
        }

        /*
        |--------------------------------------------------------------------------
        | Create Google Maps script
        |--------------------------------------------------------------------------
        */

        const script = document.createElement("script");

        script.id = "propdue-google-maps";

        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            `?key=${encodeURIComponent(
                GOOGLE_MAPS_API_KEY
            )}` +
            "&libraries=geocoding" +
            "&v=weekly" +
            "&loading=async";

        script.async = true;
        script.defer = true;

        script.onload = initializeGoogleMaps;

        script.onerror = () => {
            if (!cancelled) {
                setError(
                    "Google Maps could not be loaded. Check your API key, Maps JavaScript API, and API restrictions."
                );
            }
        };

        document.head.appendChild(script);

        return () => {
            cancelled = true;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | CREATE MAP AFTER SEARCH RESULT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !mapsReady ||
            !result ||
            !mapRef.current ||
            !window.google?.maps
        ) {
            return;
        }

        const position = {
            lat: result.latitude,
            lng: result.longitude,
        };

        const map =
            new window.google.maps.Map(
                mapRef.current,
                {
                    center: position,
                    zoom: 17,

                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,

                    styles: [
                        {
                            elementType: "geometry",
                            stylers: [
                                {
                                    color: "#111111",
                                },
                            ],
                        },
                        {
                            elementType:
                                "labels.text.fill",
                            stylers: [
                                {
                                    color: "#a8a8a8",
                                },
                            ],
                        },
                        {
                            elementType:
                                "labels.text.stroke",
                            stylers: [
                                {
                                    color: "#111111",
                                },
                            ],
                        },
                        {
                            featureType:
                                "administrative",
                            elementType: "geometry",
                            stylers: [
                                {
                                    color: "#333333",
                                },
                            ],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [
                                {
                                    color: "#292929",
                                },
                            ],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [
                                {
                                    color: "#080808",
                                },
                            ],
                        },
                    ],
                }
            );

        mapInstanceRef.current = map;

        markerRef.current =
            new window.google.maps.Marker({
                position,
                map,
                title: result.formattedAddress,
            });

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }

            mapInstanceRef.current = null;
        };
    }, [mapsReady, result]);

    /*
    |--------------------------------------------------------------------------
    | SEARCH / ADDRESS VALIDATION
    |--------------------------------------------------------------------------
    */

    async function handleSearch(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setResult(null);

        const cleanAddress = address.trim();

        if (!cleanAddress) {
            setError(
                "Please enter a property address."
            );
            return;
        }

        if (cleanAddress.length < 8) {
            setError(
                "Please enter a complete property address."
            );
            return;
        }

        if (
            !mapsReady ||
            !geocoderRef.current
        ) {
            setError(
                "Google Maps is not ready yet. Please wait a moment and try again."
            );
            return;
        }

        setLoading(true);

        try {
            const response =
                await geocoderRef.current.geocode({
                    address: cleanAddress,
                });

            if (
                !response ||
                !response.results ||
                response.results.length === 0
            ) {
                throw new Error(
                    "No address found."
                );
            }

            const firstResult =
                response.results[0];

            if (
                !firstResult.geometry ||
                !firstResult.geometry.location
            ) {
                throw new Error(
                    "Location information was not returned."
                );
            }

            const location =
                firstResult.geometry.location;

            const latitude = location.lat();
            const longitude = location.lng();

            /*
            |--------------------------------------------------------------------------
            | Extract address components
            |--------------------------------------------------------------------------
            */

            let streetNumber = "";
            let route = "";
            let city = "";
            let state = "";
            let postalCode = "";
            let country = "";

            (
                firstResult.address_components || []
            ).forEach((component) => {
                const types =
                    component.types || [];

                if (
                    types.includes("street_number")
                ) {
                    streetNumber =
                        component.long_name;
                }

                if (
                    types.includes("route")
                ) {
                    route =
                        component.long_name;
                }

                if (
                    types.includes("locality") ||
                    types.includes("postal_town")
                ) {
                    city =
                        component.long_name;
                }

                if (
                    types.includes(
                        "administrative_area_level_1"
                    )
                ) {
                    state =
                        component.short_name;
                }

                if (
                    types.includes("postal_code")
                ) {
                    postalCode =
                        component.long_name;
                }

                if (
                    types.includes("country")
                ) {
                    country =
                        component.long_name;
                }
            });

            /*
            |--------------------------------------------------------------------------
            | Build result
            |--------------------------------------------------------------------------
            */

            const propertyResult = {
                formattedAddress:
                    firstResult.formatted_address ||
                    cleanAddress,

                street:
                    [
                        streetNumber,
                        route,
                    ]
                        .filter(Boolean)
                        .join(" ") ||
                    "Not available",

                city:
                    city || "Not available",

                state:
                    state || "Not available",

                postalCode:
                    postalCode || "Not available",

                country:
                    country || "Not available",

                latitude,
                longitude,

                placeId:
                    firstResult.place_id ||
                    "Not available",

                locationType:
                    firstResult.geometry
                        .location_type ||
                    "Not available",

                types:
                    firstResult.types || [],
            };

            setResult(propertyResult);

            setSuccess(
                "Address successfully validated."
            );
        } catch (searchError) {
            console.error(
                "Address search error:",
                searchError
            );

            setError(
                "We could not validate that address. Please check the address and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">

            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

                <div className="absolute left-[-200px] top-[5%] h-[550px] w-[550px] rounded-full bg-orange-500/[0.06] blur-[150px]" />

                <div className="absolute right-[-200px] top-[35%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.05] blur-[170px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_45%)]" />

            </div>


            {/* HEADER */}

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


            {/* SEARCH */}

            <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">

                <div className="mx-auto max-w-[1400px]">

                    <form
                        onSubmit={handleSearch}
                        className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl md:p-8"
                    >

                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <label
                                htmlFor="property-address"
                                className="text-xs font-semibold tracking-[0.3em] text-white/40"
                            >
                                PROPERTY ADDRESS
                            </label>

                            <span className="flex items-center gap-2 text-xs">

                                <span
                                    className={`h-2 w-2 rounded-full ${mapsReady
                                        ? "bg-emerald-400"
                                        : "bg-yellow-400"
                                        }`}
                                />

                                <span
                                    className={
                                        mapsReady
                                            ? "text-emerald-400/70"
                                            : "text-yellow-400/70"
                                    }
                                >
                                    {mapsReady
                                        ? "Address service ready"
                                        : "Loading address service..."}
                                </span>

                            </span>

                        </div>


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
                                }}
                                placeholder="1600 Pennsylvania Avenue NW, Washington, D.C. 20500"
                                autoComplete="street-address"
                                className="min-h-[62px] flex-1 rounded-xl border border-white/10 bg-black/30 px-5 text-base text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-black/50"
                            />


                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !mapsReady
                                }
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


                        {/* SUCCESS */}

                        {success && (

                            <div className="mt-5 flex items-center gap-3 text-sm text-emerald-400">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/30">
                                    ✓
                                </span>

                                {success}

                            </div>

                        )}


                        {/* ERROR */}

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


            {/* EMPTY STATE */}

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
                                text="The address is resolved to a recognized location and geographic coordinates."
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


            {/* LOADING */}

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
                                        Resolving the address and location.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* RESULT */}

            {result && (

                <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">

                    <div className="mx-auto max-w-[1400px]">

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


                        {/* DETAILS + MAP */}

                        <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

                            <div>

                                <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                    LOCATION DETAILS
                                </p>


                                <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">

                                    <DetailCard
                                        label="Street"
                                        value={result.street}
                                    />

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

                                    <DetailCard
                                        label="Location Type"
                                        value={result.locationType}
                                    />

                                </div>


                                {/* COORDINATES */}

                                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        COORDINATES
                                    </p>

                                    <div className="mt-5 grid grid-cols-2 gap-6">

                                        <div>

                                            <p className="text-sm text-white/30">
                                                Latitude
                                            </p>

                                            <p className="mt-2 text-lg text-white/80">
                                                {result.latitude.toFixed(6)}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-white/30">
                                                Longitude
                                            </p>

                                            <p className="mt-2 text-lg text-white/80">
                                                {result.longitude.toFixed(6)}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* PLACE ID */}

                                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

                                    <p className="text-xs tracking-[0.25em] text-white/25">
                                        PLACE ID
                                    </p>

                                    <p className="mt-4 break-all text-sm leading-6 text-white/50">
                                        {result.placeId}
                                    </p>

                                </div>

                            </div>


                            {/* MAP */}

                            <div>

                                <p className="mb-6 text-xs font-semibold tracking-[0.3em] text-white/30">
                                    LOCATION
                                </p>

                                <div
                                    ref={mapRef}
                                    className="h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
                                />

                            </div>

                        </div>


                        {/* NEXT STEP */}

                        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">

                            <div>

                                <p className="text-xs font-semibold tracking-[0.3em] text-white/25">
                                    NEXT STEP
                                </p>

                                <p className="mt-3 text-xl font-light text-white/70">
                                    Continue to property details and due diligence.
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


                        {/* RESPONSE */}

                        <div className="mt-16 border-t border-white/10 pt-10">

                            <p className="text-xs font-semibold tracking-[0.3em] text-white/30">
                                VALIDATION RESPONSE
                            </p>

                            <p className="mt-2 text-sm text-white/30">
                                Useful for the Week 1 demonstration.
                            </p>

                            <pre className="mt-5 max-h-[500px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-6 text-xs leading-6 text-white/50">
                                {JSON.stringify(
                                    result,
                                    null,
                                    2
                                )}
                            </pre>

                        </div>

                    </div>

                </section>

            )}


            {/* FOOTER */}

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