export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          EstateHub
        </h1>

        <div className="hidden md:flex gap-8 text-gray-600">
          <a href="#" className="hover:text-blue-600">Home</a>
          <a href="#" className="hover:text-blue-600">Properties</a>
          <a href="#" className="hover:text-blue-600">About</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          List Property
        </button>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-50 px-8 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 font-medium text-blue-600">
            FIND YOUR DREAM HOME
          </p>

          <h2 className="text-4xl font-bold leading-tight md:text-6xl">
            Find a place you'll
            <span className="text-blue-600"> love to live.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Discover beautiful homes, apartments and properties
            that match your lifestyle and budget.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg md:flex-row">
            <input
              type="text"
              placeholder="Search location"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

            <select className="rounded-lg border px-4 py-3 outline-none">
              <option>Property Type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>House</option>
            </select>

            <button className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-medium text-blue-600">EXPLORE</p>
              <h2 className="mt-2 text-3xl font-bold">
                Featured Properties
              </h2>
            </div>

            <a href="#" className="text-blue-600 hover:underline">
              View all →
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Property 1 */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-500">
                Property Image
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500">Chennai, Tamil Nadu</p>
                <h3 className="mt-2 text-xl font-semibold">
                  Modern Family Villa
                </h3>
                <p className="mt-2 text-gray-600">
                  3 Beds • 2 Baths • 1,800 sq.ft
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₹85 Lakhs
                  </span>
                  <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Property 2 */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-500">
                Property Image
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500">Coimbatore, Tamil Nadu</p>
                <h3 className="mt-2 text-xl font-semibold">
                  Luxury Apartment
                </h3>
                <p className="mt-2 text-gray-600">
                  2 Beds • 2 Baths • 1,250 sq.ft
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₹62 Lakhs
                  </span>
                  <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Property 3 */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-500">
                Property Image
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500">Bangalore, Karnataka</p>
                <h3 className="mt-2 text-xl font-semibold">
                  Premium City Home
                </h3>
                <p className="mt-2 text-gray-600">
                  4 Beds • 3 Baths • 2,400 sq.ft
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₹1.2 Crore
                  </span>
                  <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-medium text-blue-600">WHY ESTATEHUB?</p>

          <h2 className="mt-2 text-3xl font-bold">
            Everything you need to find your home
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🏠</div>
              <h3 className="mt-4 text-xl font-semibold">
                Wide Selection
              </h3>
              <p className="mt-3 text-gray-600">
                Browse properties across different locations and budgets.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-4 text-xl font-semibold">
                Easy Search
              </h3>
              <p className="mt-3 text-gray-600">
                Quickly find properties using location and property type.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🤝</div>
              <h3 className="mt-4 text-xl font-semibold">
                Trusted Platform
              </h3>
              <p className="mt-3 text-gray-600">
                Connect with property owners and discover suitable homes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-8 py-8 text-center text-gray-300">
        <h2 className="text-xl font-bold text-white">EstateHub</h2>
        <p className="mt-2">
          Find your perfect place to call home.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          © 2026 EstateHub. All rights reserved.
        </p>
      </footer>
    </main>
  );
}