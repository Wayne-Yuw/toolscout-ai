import { useTranslations } from 'next-intl';
import HeaderBar from '@/components/HeaderBar';
import UserGreeting from '@/components/UserGreeting';

export default function HomePage() {
  const t = useTranslations('home');
  const popularTools = ['Notion', 'ChatGPT', 'Figma', 'Canva', 'Obsidian', 'Trello', 'Airtable', 'Miro'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Top Bar */}
        <HeaderBar />

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        {/* Search Section - Placeholder */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                🔍 {t('searchTitle')}
              </h2>
              <p className="text-gray-600">
                {t('searchDescription')}
              </p>
            </div>

            {/* Search Input - Placeholder */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                disabled
              />
              <button
                className="w-full mt-4 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled
              >
                {t('analyzeButton')}
              </button>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>{t('tip')}:</strong> {t('tipContent')}
              </p>
            </div>
          </div>

          {/* Popular Tools */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              🔥 {t('popularTools')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTools.map((tool) => (
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

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">
              {t('features.audienceAnalysis.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.audienceAnalysis.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">
              {t('features.scriptGeneration.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.scriptGeneration.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">
              {t('features.toolDiscovery.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.toolDiscovery.description')}
            </p>
          </div>
        </div>

        {/* Dev Mode Notice */}
        <div className="max-w-3xl mx-auto mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-center text-yellow-800">
            ⚠️ <strong>{t('devMode.title')}:</strong> {t('devMode.message')}
          </p>
        </div>
      </div>
    </main>
  )
}


