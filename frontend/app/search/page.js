export default function PropertySearch() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            EstateHub
          </h1>

          <a
            href="/"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Home
          </a>
        </div>
      </header>

      {/* Search Section */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="font-medium text-blue-600">
              PROPERTY SEARCH
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Find a Property
            </h2>

            <p className="mt-3 text-gray-600">
              Search for a property using its address and validate
              the property information.
            </p>
          </div>

          {/* Search Form */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <label className="mb-2 block font-medium">
              Property Address
            </label>

            <input
              type="text"
              placeholder="Enter property address"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

            <div className="mt-5 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                Validate Address
              </button>

              <button className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50">
                Search Property
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <h3 className="text-xl font-semibold">
              Search Filters
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Type
                </label>

                <select className="w-full rounded-lg border px-4 py-3">
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  City
                </label>

                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  State
                </label>

                <input
                  type="text"
                  placeholder="Enter state"
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold">
              Search Results
            </h3>

            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {/* Property Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="flex h-44 items-center justify-center bg-gray-200 text-gray-500">
                  Property Image
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-500">
                    Chennai, Tamil Nadu
                  </p>

                  <h4 className="mt-2 text-lg font-semibold">
                    Modern Family Villa
                  </h4>

                  <p className="mt-2 text-gray-600">
                    Residential • 3 Beds • 2 Baths
                  </p>

                  <a
  href="/property/1"
  className="mt-4 block w-full rounded-lg bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
>
  View Details
</a>
                </div>
              </div>

              {/* Property Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="flex h-44 items-center justify-center bg-gray-200 text-gray-500">
                  Property Image
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-500">
                    Chennai, Tamil Nadu
                  </p>

                  <h4 className="mt-2 text-lg font-semibold">
                    Luxury Apartment
                  </h4>

                  <p className="mt-2 text-gray-600">
                    Residential • 2 Beds • 2 Baths
                  </p>

                  <a
  href="/property/1"
  className="mt-4 block w-full rounded-lg bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
>
  View Details
</a>
                </div>
              </div>

              {/* Property Card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="flex h-44 items-center justify-center bg-gray-200 text-gray-500">
                  Property Image
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-500">
                    Bangalore, Karnataka
                  </p>

                  <h4 className="mt-2 text-lg font-semibold">
                    Premium City Home
                  </h4>

                  <p className="mt-2 text-gray-600">
                    Residential • 4 Beds • 3 Baths
                  </p>

                  <a
  href="/property/1"
  className="mt-4 block w-full rounded-lg bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
>
  View Details
</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}