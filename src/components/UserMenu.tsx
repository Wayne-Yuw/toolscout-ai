'use client';

/**
 * 用户菜单组件
 * 显示在导航栏，用于展示用户信息和登录/注册入口
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 客户端挂载后加载用户信息
  useEffect(() => {
    setMounted(true);
    loadUser();
  }, [loadUser]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    router.push('/');
  };

  // 避免服务端渲染时的 hydration 问题
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // 未登录状态
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          注册
        </Link>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        {/* 头像 */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {user.nickname?.[0] || user.username[0].toUpperCase()}
        </div>

        {/* 用户名 */}
        <span className="text-sm font-medium text-gray-700">
          {user.nickname || user.username}
        </span>

        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>

          {/* 菜单内容 */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.nickname || user.username}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user.phone}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                  {user.membership_level === 'free' && '免费版'}
                  {user.membership_level === 'basic' && '基础版'}
                  {user.membership_level === 'pro' && '专业版'}
                  {user.membership_level === 'enterprise' && '企业版'}
                </span>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="py-1">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowDropdown(false)}
              >
                📊 控制台
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowDropdown(false)}
              >
                👤 个人资料
              </Link>
              <Link
                href="/membership"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowDropdown(false)}
              >
                💎 会员中心
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowDropdown(false)}
              >
                ⚙️ 设置
              </Link>
            </div>

            {/* 登出 */}
            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
              >
                🚪 退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
