'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/auth-store';
import { checkUsername, checkPhone } from '@/lib/api-auth';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateUsername = (username: string): string | null => {
    if (username.length < 3 || username.length > 20) return t('errors.usernameLen');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return t('errors.usernameChars');
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!/^1[3-9]\d{9}$/.test(phone)) return t('errors.phoneInvalid');
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8 || password.length > 32) return t('errors.pwdLen');
    if (!/[a-z]/.test(password)) return t('errors.pwdLower');
    if (!/[A-Z]/.test(password)) return t('errors.pwdUpper');
    if (!/\d/.test(password)) return t('errors.pwdDigit');
    return null;
  };

  const handleUsernameBlur = async () => {
    const username = formData.username;
    if (!username) return;
    const formatError = validateUsername(username);
    if (formatError) { setFieldErrors({ ...fieldErrors, username: formatError }); return; }
    const isAvailable = await checkUsername(username);
    if (!isAvailable) setFieldErrors({ ...fieldErrors, username: t('errors.usernameTaken') });
    else { const e = { ...fieldErrors }; delete e.username; setFieldErrors(e); }
  };

  const handlePhoneBlur = async () => {
    const phone = formData.phone;
    if (!phone) return;
    const formatError = validatePhone(phone);
    if (formatError) { setFieldErrors({ ...fieldErrors, phone: formatError }); return; }
    const isAvailable = await checkPhone(phone);
    if (!isAvailable) setFieldErrors({ ...fieldErrors, phone: t('errors.phoneTaken') });
    else { const e = { ...fieldErrors }; delete e.phone; setFieldErrors(e); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.username || !formData.phone || !formData.password) {
      setError(t('errors.fillRequired'));
      return;
    }
    const usernameError = validateUsername(formData.username);
    if (usernameError) { setFieldErrors({ username: usernameError }); return; }
    const phoneError = validatePhone(formData.phone);
    if (phoneError) { setFieldErrors({ phone: phoneError }); return; }
    const passwordError = validatePassword(formData.password);
    if (passwordError) { setFieldErrors({ password: passwordError }); return; }
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: t('errors.pwdNotMatch') });
      return;
    }

    try {
      await register({
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
        email: formData.email || undefined,
        nickname: formData.nickname || undefined,
      });
      router.push('/');
    } catch (err: any) {
      setError(err?.message || t('errors.failGeneric'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t('username')} <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onBlur={handleUsernameBlur}
                className={`appearance-none relative block w-full px-4 py-3 border ${fieldErrors.username ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder={t('usernamePlaceholder')}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                className={`appearance-none relative block w-full px-4 py-3 border ${fieldErrors.phone ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder={t('phonePlaceholder')}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 pr-10 border ${fieldErrors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  aria-label="toggle password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.29 18.29 0 0 1 5.06-6.94"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 pr-10 border ${fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder={t('confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  aria-label="toggle confirm password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.29 18.29 0 0 1 5.06-6.94"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">{t('nickname')}</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder={t('nicknamePlaceholder')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('submitting')}
                </span>
              ) : (
                t('submit')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('hasAccount')}{' '}
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                {t('goLogin')}
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {t('agreePrefix')} <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">{t('terms')}</Link> {t('and')}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500"> {t('privacy')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
