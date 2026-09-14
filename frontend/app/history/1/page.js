export default function PropertyHistory() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            EstateHub
          </h1>

          <a
            href="/search"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Back to Search
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Property History
        </h2>

        <p className="mt-2 text-gray-600">
          Property ID: 1
        </p>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h3 className="text-xl font-semibold text-gray-900">
            History of Property #1
          </h3>

          <div className="mt-6 space-y-4">
            <div className="border-b pb-4">
              <p className="font-medium">2024</p>
              <p className="text-gray-600">
                Property registered.
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="font-medium">2025</p>
              <p className="text-gray-600">
                Property ownership updated.
              </p>
            </div>

            <div>
              <p className="font-medium">2026</p>
              <p className="text-gray-600">
                Latest property information available.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}