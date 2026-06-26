'use client';

import { useState } from 'react';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const devAdminEmail = process.env.NODE_ENV !== 'production' ? process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? '' : '';
  const devAdminPassword = process.env.NODE_ENV !== 'production' ? process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD ?? '' : '';
  const hasDevAdminPrefill = Boolean(devAdminEmail && devAdminPassword);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState(devAdminEmail);
  const [password, setPassword] = useState(devAdminPassword);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '登入失敗');
        return;
      }

      window.location.href = '/';
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[#fbfaf7] px-4 py-8 text-stone-950 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,130,60,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(31,23,16,0.10),_transparent_32%)]" />
      <div className="relative mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-center">
        <section data-testid="auth-primary-panel" className="rounded-[2rem] border border-stone-200 bg-white/95 p-4 shadow-2xl shadow-stone-900/10 backdrop-blur sm:p-5">
          <div className="rounded-[1.5rem] border border-stone-100 bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.20em] text-stone-400">Trip Planner</p>
                <h1 className="mt-2 text-3xl font-black text-stone-950">{mode === 'login' ? '登入' : '註冊'}</h1>
                <p className="mt-2 text-sm text-stone-500">{mode === 'login' ? '回到你的旅程工作台' : '建立帳號開始規劃'}</p>
              </div>
              {hasDevAdminPrefill && mode === 'login' && (
                <p data-testid="auth-support-note" className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                  開發帳號已帶入
                </p>
              )}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-xl py-2 text-sm font-black transition-all ${mode === 'login' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-xl py-2 text-sm font-black transition-all ${mode === 'register' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                註冊
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="mb-1 block text-sm font-bold text-stone-700">顯示名稱</label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-[#fffaf2] px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="mb-1 block text-sm font-bold text-stone-700">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-[#fffaf2] px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-1 block text-sm font-bold text-stone-700">密碼（至少 8 碼）</label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-[#fffaf2] px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>

              {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-[#1f1710] py-3 font-black text-amber-50 shadow-lg shadow-stone-900/20 transition hover:bg-[#352719] disabled:opacity-60"
              >
                {submitting ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
              </button>
            </form>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.20em] text-amber-800">
            Private concierge
          </p>
          <h2 className="max-w-xl font-serif text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
            登入後，直接處理下一個旅程缺口。
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
            管理旅程、靈感清單、每日行程、地圖路線與分享連結；少一點介紹，多一點行動。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {['旅程進度', '靈感審核', '交付分享'].map((item) => (
              <div key={item} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
