export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ToolScout AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered tool analysis assistant for content creators
          </p>
        </header>

        {/* Search Section - Placeholder */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                🔍 Search for a Tool
              </h2>
              <p className="text-gray-600">
                Enter a tool name or website URL to begin analysis
              </p>
            </div>

            {/* Search Input - Placeholder */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="e.g., Notion or https://www.notion.so"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                disabled
              />
              <button
                className="w-full mt-4 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled
              >
                Analyze Tool
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Enter a tool name and we'll find the official website,
                or paste the full URL to analyze directly
              </p>
            </div>
          </div>

          {/* Popular Tools - Placeholder */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              🔥 Popular Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Notion', 'ChatGPT', 'Figma', 'Canva', 'Obsidian', 'Trello', 'Airtable', 'Miro'].map((tool) => (
                <button
                  key={tool}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors disabled:cursor-not-allowed"
                  disabled
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Audience Analysis</h3>
            <p className="text-gray-600">
              Multi-angle audience segmentation with pain points and solutions
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Script Generation</h3>
            <p className="text-gray-600">
              Ready-to-use video scripts tailored to your platform and style
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Tool Discovery</h3>
            <p className="text-gray-600">
              Smart recommendations for similar and complementary tools
            </p>
          </div>
        </div>

        {/* Status Notice */}
        <div className="max-w-3xl mx-auto mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-center text-yellow-800">
            ⚠️ <strong>Development Mode:</strong> This is a project skeleton.
            Core functionality will be implemented in upcoming iterations.
          </p>
        </div>
      </div>
    </main>
  )
}
