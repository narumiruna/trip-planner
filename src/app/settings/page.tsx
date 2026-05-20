'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('新密碼至少需要 8 個字元');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新密碼與確認密碼不一致');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '密碼修改失敗');
        return;
      }

      setSuccess('密碼已成功修改');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#fbfaf7] px-4 py-8 text-stone-950 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
        >
          ← 返回首頁
        </Link>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-950">帳號設定</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">修改你的密碼。</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-sm font-bold text-stone-700">目前密碼</label>
              <input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-bold text-stone-700">
                新密碼（至少 8 碼）
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-bold text-stone-700">確認新密碼</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>

            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
            {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#7a3f18] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#653314] disabled:opacity-60"
            >
              {submitting ? '處理中...' : '修改密碼'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
