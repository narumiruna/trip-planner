'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.10),_transparent_34%)]" />
      <div className="relative mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm transition-colors hover:border-amber-300/70 hover:text-amber-800"
        >
          ← 返回首頁
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_28rem] lg:items-start">
          <section className="rounded-[2rem] border border-amber-100 bg-white/85 p-7 shadow-xl shadow-slate-100 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-800">Private account control</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">帳號設定</h1>
            <p className="mt-3 max-w-xl text-slate-600">
              保持規劃工作區安全，讓旅程檔案、共編權限與公開分享連結都維持在可信任的帳號下。
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['密碼安全', '旅程權限', '分享控管'].map((item) => (
                <div key={item} className="rounded-2xl border border-amber-200 bg-[#fffaf2] p-4 text-sm font-bold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-white/90 p-4 shadow-2xl shadow-amber-900/10 backdrop-blur">
            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6">
              <h2 className="text-2xl font-black text-slate-950">修改密碼</h2>
              <p className="mt-2 text-sm text-slate-500">建議使用至少 8 碼、包含不同字元類型的密碼。</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">目前密碼</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">
                    新密碼（至少 8 碼）
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">確認新密碼</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
                {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[#1f1710] py-3 font-black text-amber-50 shadow-lg shadow-amber-900/20 transition hover:bg-[#352719] disabled:opacity-60"
                >
                  {submitting ? '處理中...' : '修改密碼'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
