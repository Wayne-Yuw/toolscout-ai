import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'ToolScout AI - AI-Powered Tool Analysis Assistant',
  description: 'Analyze tool websites, generate audience insights, and create video scripts in seconds',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return children;
}
