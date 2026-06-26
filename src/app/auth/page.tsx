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
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,130,60,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,23,16,0.14),_transparent_34%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_28rem] lg:items-center">
        <section>
          <p className="mb-4 inline-flex rounded-full border border-amber-300/70 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-amber-800 shadow-sm">
            Atelier access
          </p>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Continue building travel plans that feel expertly designed.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Sign in to manage private trip dossiers, curated activities, route-ready itineraries, collaboration, and public share links.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Secure workspace', 'Concierge curation', 'Shareable dossiers'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-white/90 p-4 shadow-2xl shadow-amber-900/10 backdrop-blur">
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Trip Planner Atelier</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">{mode === 'login' ? '登入' : '註冊'}</h2>
              <p className="mt-2 text-sm text-slate-500">{mode === 'login' ? '使用帳號繼續規劃旅程' : '建立新帳號開始使用'}</p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-xl py-2 text-sm font-black transition-all ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-xl py-2 text-sm font-black transition-all ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                註冊
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {hasDevAdminPrefill && mode === 'login' && (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                  開發帳號已自動帶入，可直接登入。
                </p>
              )}
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="mb-1 block text-sm font-bold text-slate-700">顯示名稱</label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="mb-1 block text-sm font-bold text-slate-700">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-1 block text-sm font-bold text-slate-700">密碼（至少 8 碼）</label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>

              {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-[#1f1710] py-3 font-black text-amber-50 shadow-lg shadow-amber-900/20 transition hover:bg-[#352719] disabled:opacity-60"
              >
                {submitting ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
