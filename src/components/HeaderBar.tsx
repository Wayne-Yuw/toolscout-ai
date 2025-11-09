'use client';
import UserGreeting from '@/components/UserGreeting';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HeaderBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-end gap-3">
        <UserGreeting />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
