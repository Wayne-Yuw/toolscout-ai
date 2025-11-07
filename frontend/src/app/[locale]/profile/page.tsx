import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('common');
  return (
    <div className="min-h-[50vh] bg-white rounded-2xl shadow p-8 flex items-center justify-center text-gray-600">
      <div>
        <h1 className="text-2xl font-semibold mb-2">个人中心</h1>
        <p>即将推出，敬请期待。</p>
      </div>
    </div>
  );
}
