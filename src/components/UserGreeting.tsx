'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function UserGreeting() {
  const router = useRouter();
  const t = useTranslations('userMenu');
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
      >
        {t('login')}
      </Link>
    );
  }

  const name = user.nickname || user.username;
  const avatar = user.avatar_url;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      router.replace('/');
      router.refresh();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 bg-white/70 backdrop-blur px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            {(name || '?').slice(0,1).toUpperCase()}
          </div>
        )}
        <span className="text-gray-800 font-medium max-w-[140px] truncate">{name}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 z-20 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <Link
              href="/profile"
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {t('profile')}
            </Link>
            <button
              className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              {t('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
