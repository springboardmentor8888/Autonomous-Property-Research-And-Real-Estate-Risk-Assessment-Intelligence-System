import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Sparkles,
  Building2,
  ArrowRight,
  Clock3,
  X,
} from "lucide-react";

function PropertySearch() {
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches when page opens
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");

    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Search property
  const handleSearch = () => {
    const cleanAddress = address.trim();

    if (!cleanAddress) {
      alert("Please enter a property address.");
      return;
    }

    if (cleanAddress.length < 5) {
      alert("Please enter a valid property address.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY FRONTEND DATA

      Later:
      This section will call your backend API.

      Example:

      const response = await fetch(
        "http://localhost:8080/api/properties/search"
      );
    */

    setTimeout(() => {
      const newProperty = {
        id: `PROP-${Date.now()}`,
        address: cleanAddress,
        type: "Residential Property",
        status: "Research Ready",
        searchedAt: new Date().toISOString(),
      };

      setProperty(newProperty);

      // Save selected property
      localStorage.setItem(
        "selectedProperty",
        JSON.stringify(newProperty)
      );

      // Add to recent searches
      const oldSearches =
        JSON.parse(
          localStorage.getItem("recentSearches")
        ) || [];

      const updatedSearches = [
        newProperty,
        ...oldSearches.filter(
          (item) =>
            item.address.toLowerCase() !==
            cleanAddress.toLowerCase()
        ),
      ].slice(0, 5);

      setRecentSearches(updatedSearches);

      localStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedSearches)
      );

      setLoading(false);
    }, 1000);
  };

  // Start AI research
  const handleStartResearch = () => {
    if (!property) {
      alert("Please search for a property first.");
      return;
    }

    navigate("/due-diligence", {
      state: {
        property: property,
      },
    });
  };

  // Select property from recent searches
  const handleRecentProperty = (item) => {
    setProperty(item);
    setAddress(item.address);

    localStorage.setItem(
      "selectedProperty",
      JSON.stringify(item)
    );
  };

  // Remove recent search
  const removeRecentSearch = (id) => {
    const updatedSearches = recentSearches.filter(
      (item) => item.id !== id
    );

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches)
    );
  };

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Property Research
        </h1>

        <p className="mt-2 text-gray-500">
          Search a property to begin AI-powered due diligence.
        </p>
      </div>


      {/* ================= SEARCH CARD ================= */}

      <div className="bg-white rounded-xl border shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <MapPin
              className="text-green-600"
              size={22}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Find a Property
            </h2>

            <p className="text-sm text-gray-500">
              Enter the property address to begin research.
            </p>
          </div>

        </div>


        {/* SEARCH INPUT */}

        <div className="flex flex-col md:flex-row gap-3">

          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 flex-1 focus-within:ring-2 focus-within:ring-green-500">

            <Search
              size={20}
              className="text-gray-400"
            />

            <input
              type="text"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Enter property address..."
              className="outline-none w-full text-gray-700"
            />

          </div>


          {/* SEARCH BUTTON */}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition"
          >

            {loading ? (
              <>
                <span className="animate-spin">
                  ⟳
                </span>

                Searching...
              </>
            ) : (
              <>
                <Search size={19} />

                Search Property
              </>
            )}

          </button>

        </div>

      </div>


      {/* ================= PROPERTY RESULT ================= */}

      {property && (

        <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">

          {/* RESULT HEADER */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">

                <Building2
                  className="text-blue-600"
                  size={23}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Property Found
                </h2>

                <p className="text-sm text-gray-500">
                  {property.address}
                </p>

              </div>

            </div>


            <span className="w-fit text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {property.status}
            </span>

          </div>


          {/* PROPERTY INFORMATION */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Property ID
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {property.id}
              </p>

            </div>


            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Property Type
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {property.type}
              </p>

            </div>


            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Research Status
              </p>

              <p className="font-medium text-green-600 mt-1">
                Ready
              </p>

            </div>

          </div>


          {/* ADDRESS */}

          <div className="mt-4 border rounded-lg p-4">

            <p className="text-sm text-gray-500">
              Property Address
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {property.address}
            </p>

          </div>


          {/* AI RESEARCH BUTTON */}

          <button
            onClick={handleStartResearch}
            className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-lg font-medium transition"
          >

            <Sparkles size={19} />

            Start AI Due Diligence

            <ArrowRight size={18} />

          </button>

        </div>
      )}


      {/* ================= AI INFORMATION ================= */}

      {!property && (

        <div className="mt-6 bg-slate-900 rounded-xl p-6 text-white">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">

              <Sparkles
                className="text-green-400"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold">
                AI-Powered Property Research
              </h2>

              <p className="text-sm text-slate-400">
                REDDA analyzes property data and identifies
                potential risks before you make a decision.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <div className="bg-white/5 rounded-lg p-4">

              <p className="text-sm text-slate-400">
                Property Data
              </p>

              <p className="mt-1 font-medium">
                Ownership & Valuation
              </p>

            </div>


            <div className="bg-white/5 rounded-lg p-4">

              <p className="text-sm text-slate-400">
                Document Analysis
              </p>

              <p className="mt-1 font-medium">
                AI Document Review
              </p>

            </div>


            <div className="bg-white/5 rounded-lg p-4">

              <p className="text-sm text-slate-400">
                Risk Detection
              </p>

              <p className="mt-1 font-medium">
                AI Risk Assessment
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ================= RECENT SEARCHES ================= */}

      <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">

        <div className="flex items-center gap-2">

          <Clock3
            size={20}
            className="text-gray-500"
          />

          <h2 className="text-lg font-semibold text-gray-800">
            Recent Searches
          </h2>

        </div>

        <p className="text-sm text-gray-500 mt-1">
          Recently researched properties.
        </p>


        {recentSearches.length === 0 ? (

          <div className="mt-5 border rounded-lg p-6">

            <p className="text-sm text-gray-400 text-center">
              No recent searches
            </p>

          </div>

        ) : (

          <div className="mt-5 space-y-3">

            {recentSearches.map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition"
              >

                <button
                  onClick={() =>
                    handleRecentProperty(item)
                  }
                  className="flex items-center gap-3 text-left flex-1"
                >

                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

                    <MapPin
                      size={18}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <p className="font-medium text-gray-800">
                      {item.address}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {item.type}
                    </p>

                  </div>

                </button>


                <button
                  onClick={() =>
                    removeRecentSearch(item.id)
                  }
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="Remove"
                >

                  <X size={18} />

                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default PropertySearch;