'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Me = {
  id: string;
  email: string;
  name: string;
};

export default function AuthNav() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setMe(data);
      })
      .catch(() => {
        if (active) setMe(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth');
    router.refresh();
  }

  if (!me) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-bold">
      <span className="hidden max-w-32 truncate text-stone-600 sm:inline">{me.name}</span>
      <Link
        href="/settings"
        className="rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:text-amber-800"
      >
        設定
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:text-amber-800"
      >
        登出
      </button>
    </div>
  );
}
