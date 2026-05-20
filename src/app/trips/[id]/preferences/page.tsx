'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Preference {
  id: string;
  userId: string;
  likes: string;
  dislikes: string;
  budget: string | null;
  preferredLanguage: string | null;
}

interface Me {
  id: string;
  email: string;
  name: string;
}

export default function PreferencesPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [me, setMe] = useState<Me | null>(null);
  const [preferences, setPreferences] = useState<Preference | null>(null);
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [budget, setBudget] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchMeAndPreferences();
  }, []);

  async function fetchMeAndPreferences() {
    const meRes = await fetch('/api/me');
    if (meRes.ok) {
      const meData = await meRes.json();
      setMe(meData);
    }

    const prefRes = await fetch('/api/me/preferences');
    if (prefRes.ok) {
      const data = await prefRes.json();
      if (data) {
        setPreferences(data);
        setLikes(JSON.parse(data.likes).join(', '));
        setDislikes(JSON.parse(data.dislikes).join(', '));
        setBudget(data.budget || '');
        setPreferredLanguage(data.preferredLanguage || '');
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const likesArr = likes.split(',').map((s) => s.trim()).filter(Boolean);
      const dislikesArr = dislikes.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/me/preferences', {
        method: preferences ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes: likesArr, dislikes: dislikesArr, budget, preferredLanguage }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-stone-950 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100';

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden px-4 py-10 sm:px-6 lg:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,130,60,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(31,23,16,0.12),_transparent_34%)]" />
      <div className="relative mx-auto max-w-5xl">
        <Link href={`/trips/${tripId}`} className="mb-6 inline-flex rounded-full border border-amber-200 bg-white/85 px-4 py-2 text-sm font-black text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:text-amber-800">
          ← Back to Trip
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <section className="rounded-[2rem] border border-amber-100 bg-white/80 p-7 shadow-xl shadow-amber-900/10 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-800">Traveler taste profile</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-stone-950">Travel Preferences</h1>
            <p className="mt-3 text-stone-600">Give the AI concierge your taste signals so suggested activities feel personal, well-paced, and worthy of the trip.</p>
            {me && <p className="mt-5 rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm font-bold text-stone-600">Current traveler: {me.name} ({me.email})</p>}
            <div className="mt-6 grid gap-3">
              {['Dining rituals and cultural interests', 'Avoided crowds or low-fit stops', 'Budget and language context'].map((item) => (
                <div key={item} className="rounded-2xl border border-amber-100 bg-white/75 p-4 text-sm font-bold text-stone-700">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-white/90 p-4 shadow-2xl shadow-amber-900/10 backdrop-blur">
            <div className="rounded-[1.5rem] border border-amber-100 bg-white p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">Concierge brief</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">
                {preferences ? 'Edit Preferences' : 'Set Preferences'}
              </h2>
              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">
                    Likes <span className="font-normal text-stone-500">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="e.g. Italian food, museums, hiking, jazz music"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">
                    Dislikes <span className="font-normal text-stone-500">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={dislikes}
                    onChange={(e) => setDislikes(e.target.value)}
                    placeholder="e.g. crowded tourist traps, fast food, clubs"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">简体中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="budget">💰 Budget</option>
                    <option value="mid-range">💰💰 Mid-range</option>
                    <option value="luxury">💰💰💰 Luxury</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-[#1f1710] py-3 font-black text-amber-50 shadow-lg shadow-amber-900/20 transition hover:bg-[#352719] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
