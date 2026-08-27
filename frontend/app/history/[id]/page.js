export default function PropertyHistory() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            EstateHub
          </h1>

          <a
            href="/property/1"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Back to Property
          </a>
        </div>
      </header>

      {/* Property History */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">

          <p className="font-medium text-blue-600">
            PROPERTY HISTORY
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Modern Family Villa
          </h2>

          <p className="mt-2 text-gray-600">
            📍 Chennai, Tamil Nadu
          </p>

          {/* Timeline */}
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-md">
            <h3 className="text-2xl font-bold">
              Property Timeline
            </h3>

            <div className="mt-8 space-y-8">

              {/* 2026 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  <div className="h-full w-0.5 bg-blue-200"></div>
                </div>

                <div>
                  <p className="font-bold text-blue-600">
                    2026
                  </p>

                  <h4 className="mt-1 font-semibold">
                    Property Information Updated
                  </h4>

                  <p className="mt-1 text-gray-600">
                    Property records were updated.
                  </p>
                </div>
              </div>

              {/* 2025 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  <div className="h-full w-0.5 bg-blue-200"></div>
                </div>

                <div>
                  <p className="font-bold text-blue-600">
                    2025
                  </p>

                  <h4 className="mt-1 font-semibold">
                    Property Tax Record Updated
                  </h4>

                  <p className="mt-1 text-gray-600">
                    Property tax information was updated.
                  </p>
                </div>
              </div>

              {/* 2024 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  <div className="h-full w-0.5 bg-blue-200"></div>
                </div>

                <div>
                  <p className="font-bold text-blue-600">
                    2024
                  </p>

                  <h4 className="mt-1 font-semibold">
                    Ownership Information Recorded
                  </h4>

                  <p className="mt-1 text-gray-600">
                    Ownership information was recorded.
                  </p>
                </div>
              </div>

              {/* 2023 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                </div>

                <div>
                  <p className="font-bold text-blue-600">
                    2023
                  </p>

                  <h4 className="mt-1 font-semibold">
                    Property Registered
                  </h4>

                  <p className="mt-1 text-gray-600">
                    Property was registered in the system.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Property Value History */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
            <h3 className="text-2xl font-bold">
              Property Value History
            </h3>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3">
                      Year
                    </th>

                    <th className="px-4 py-3">
                      Estimated Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3">
                      2026
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-600">
                      ₹85 Lakhs
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="px-4 py-3">
                      2025
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      ₹80 Lakhs
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3">
                      2024
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      ₹75 Lakhs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}