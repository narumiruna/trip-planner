'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import TripCard from '@/components/TripCard';
import { summarizePortfolioPriority } from '@/lib/portfolio-priority';

interface Trip {
  id: string;
  name: string;
  cities: string;
  createdAt: string;
  startDate?: string | null;
  durationDays?: number | null;
  counts?: {
    activitiesCount: number;
    itineraryItemsCount: number;
  };
}

interface TripApiResponse {
  id: string;
  name: string;
  cities: string;
  createdAt: string;
  startDate?: string | null;
  durationDays?: number | null;
  _count?: { activities: number; itineraryItems: number };
}

interface MeApiResponse {
  id: string;
  email: string;
  name: string;
}

function normalizeTrips(data: unknown): Trip[] {
  return Array.isArray(data)
    ? (data as TripApiResponse[]).map((trip) => ({
      id: trip.id,
      name: trip.name,
      cities: trip.cities,
      createdAt: trip.createdAt,
      startDate: trip.startDate ?? null,
      durationDays: trip.durationDays ?? null,
      counts: trip._count
        ? {
          activitiesCount: trip._count.activities,
          itineraryItemsCount: trip._count.itineraryItems,
        }
        : undefined,
    }))
    : [];
}

export default function Home() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [citiesInput, setCitiesInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [durationDaysInput, setDurationDaysInput] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const [meRes, tripsRes] = await Promise.all([fetch('/api/me'), fetch('/api/trips')]);
      if (meRes.status === 401 || tripsRes.status === 401) {
        window.location.href = '/auth';
        return;
      }

      if (meRes.ok) {
        const me = await meRes.json() as MeApiResponse;
        setUserName(me.name || me.email?.split('@')[0] || '旅人');
      }

      const tripsData: unknown = await tripsRes.json();
      setTrips(normalizeTrips(tripsData));
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  async function handleDeleteTrip(tripId: string) {
    if (!window.confirm('確定要刪除這個旅程？')) return;

    const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
    if (res.ok) {
      setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== tripId));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const cities = citiesInput.split(',').map(c => c.trim()).filter(Boolean);
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cities,
          startDate: startDateInput || null,
          durationDays: durationDaysInput ? Number(durationDaysInput) : null,
        }),
      });
      if (res.ok) {
        const trip = await res.json();
        router.push(`/trips/${trip.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  const totalActivities = trips.reduce((sum, trip) => sum + (trip.counts?.activitiesCount ?? 0), 0);
  const plannedItems = trips.reduce((sum, trip) => sum + (trip.counts?.itineraryItemsCount ?? 0), 0);
  const portfolioPriority = summarizePortfolioPriority(trips);
  const greetingName = userName || '旅人';

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="rounded-[2rem] border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
                {greetingName}，下一站？
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                直接回到你的旅程、補齊缺口，或開始一份新的旅行計畫。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex justify-center rounded-full bg-[#7a3f18] px-6 py-3 text-sm font-black text-white shadow-lg shadow-stone-900/10 transition hover:bg-[#653314]"
            >
              + 新增旅程
            </button>
          </div>

          {portfolioPriority && (
            <div data-testid="next-move-banner" className="mt-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-black text-stone-950">下一步</span>
                <span className="mx-2 text-stone-300">/</span>
                <span className="font-bold">{portfolioPriority.label}</span>
                <span className="mx-2 text-stone-300">·</span>
                <span>{portfolioPriority.tripName}</span>
                <p className="mt-1 text-xs leading-5 text-stone-500">{portfolioPriority.detail}</p>
              </div>
              <Link
                href={`/trips/${portfolioPriority.tripId}`}
                className="inline-flex shrink-0 justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-black text-stone-800 transition hover:bg-stone-100"
              >
                {portfolioPriority.actionLabel}
              </Link>
            </div>
          )}
        </section>

        {showForm && (
          <section className="mt-6 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-950">新增旅程</h2>
                <p className="mt-1 text-sm text-stone-500">先填入目的地與時間框架，細節之後再整理。</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-stone-200 px-3 py-1 text-sm font-bold text-stone-500 hover:bg-stone-50">
                關閉
              </button>
            </div>
            <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label htmlFor="trip-name" className="mb-1 block text-sm font-bold text-stone-700">旅程名稱</label>
                <input
                  id="trip-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例如：關西春日小旅行"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                />
              </div>
              <div className="lg:col-span-3">
                <label htmlFor="trip-cities" className="mb-1 block text-sm font-bold text-stone-700">城市（以逗號分隔）</label>
                <input
                  id="trip-cities"
                  type="text"
                  value={citiesInput}
                  onChange={e => setCitiesInput(e.target.value)}
                  placeholder="例如：大阪, 京都, 奈良"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                />
              </div>
              <div className="lg:col-span-2">
                <label htmlFor="trip-start-date" className="mb-1 block text-sm font-bold text-stone-700">開始日期（選填）</label>
                <input
                  id="trip-start-date"
                  type="date"
                  value={startDateInput}
                  onChange={e => setStartDateInput(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                />
              </div>
              <div className="lg:col-span-2">
                <label htmlFor="trip-duration-days" className="mb-1 block text-sm font-bold text-stone-700">天數（選填）</label>
                <input
                  id="trip-duration-days"
                  type="number"
                  min={1}
                  step={1}
                  value={durationDaysInput}
                  onChange={e => setDurationDaysInput(e.target.value)}
                  placeholder="例如：5"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                />
              </div>
              <div className="flex items-end lg:col-span-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-2xl bg-[#7a3f18] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#653314] disabled:opacity-50"
                >
                  {creating ? '建立中...' : '建立旅程'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section id="my-trips" className="mt-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-950">我的旅程</h2>
              <p className="mt-1 text-sm text-stone-500">{trips.length} 個旅程 · {totalActivities} 個靈感 · {plannedItems} 個已排程</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full spinner-gradient"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-sm">
              <h3 className="text-xl font-black text-stone-800">還沒有旅程</h3>
              <p className="mx-auto mt-2 mb-6 max-w-md text-sm leading-6 text-stone-500">新增第一個旅程，把鬆散的靈感整理成可以執行的旅行計畫。</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-full bg-[#7a3f18] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#653314]"
              >
                建立第一個旅程
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
