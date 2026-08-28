export default function PropertyDetails() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            EstateHub
          </h1>

          <a
            href="/search"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Back to Search
          </a>
        </div>
      </header>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">

          {/* Heading */}
          <p className="font-medium text-blue-600">
            PROPERTY DETAILS
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Modern Family Villa
          </h2>

          <p className="mt-2 text-gray-600">
            📍 123 Main Street, Chennai, Tamil Nadu
          </p>

          {/* Property Image */}
          <div className="mt-8 flex h-80 items-center justify-center rounded-2xl bg-gray-200 text-gray-500">
            Property Image
          </div>

          {/* Basic Information */}
          <div className="mt-8 grid gap-6 md:grid-cols-4">

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Property Type
              </p>
              <p className="mt-2 font-semibold">
                Residential
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Bedrooms
              </p>
              <p className="mt-2 font-semibold">
                3 Beds
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Bathrooms
              </p>
              <p className="mt-2 font-semibold">
                2 Baths
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Area
              </p>
              <p className="mt-2 font-semibold">
                1,800 sq.ft
              </p>
            </div>

          </div>

          {/* Property Information */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold">
              Property Information
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">
                  Address
                </span>

                <span className="font-medium text-right">
                  123 Main Street, Chennai
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">
                  Property Type
                </span>

                <span className="font-medium">
                  Residential
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">
                  Current Value
                </span>

                <span className="font-bold text-blue-600">
                  ₹85 Lakhs
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">
                  Ownership Status
                </span>

                <span className="font-medium text-green-600">
                  Information Available
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Verification Status
                </span>

                <span className="font-medium text-green-600">
                  Ready for Review
                </span>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold">
              Description
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              Modern Family Villa is a residential property
              located in Chennai, Tamil Nadu. The property
              contains three bedrooms, two bathrooms and
              approximately 1,800 square feet of area.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">

            <a
              href="/history/1"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700"
            >
              View Property History
            </a>

            <button
              type="button"
              className="flex-1 rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50"
            >
              View Due Diligence
            </button>

          </div>

        </div>
      </section>
    </main>
  );
}