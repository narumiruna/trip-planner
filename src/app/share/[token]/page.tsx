'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { compareItineraryTimeBlock } from '@/lib/time-block';
import { buildMapActivities } from '@/lib/map-activities';

const ItineraryView = dynamic(() => import('@/components/ItineraryView'), { ssr: false });
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  reason: string;
  lat: number;
  lng: number;
  city: string;
  suggestedTime: string;
  durationMinutes: number | null;
  status: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  timeBlock: string;
  order: number;
  activity: Activity;
}

interface Trip {
  id: string;
  name: string;
  cities: string;
  startDate?: string | null;
  durationDays?: number | null;
  itineraryVisibleDays?: number | null;
  activities: Activity[];
  itineraryItems: ItineraryItem[];
}

interface WeatherDay {
  date: string;
  weathercode: number;
  temp_max: number;
  temp_min: number;
  emoji: string;
  label: string;
}

type Tab = 'itinerary' | 'activities' | 'map';

export default function SharePage() {
  const { token } = useParams() as { token: string };
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [weatherByDay, setWeatherByDay] = useState<Record<number, WeatherDay>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('approved');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/public/trips/${token}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        if (!res.ok) { setFetchError(true); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setTrip(data as Trip);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!trip?.startDate || !trip.cities) return;
    const cities: string[] = JSON.parse(trip.cities);
    if (!cities.length) return;
    const primaryCity = cities[0];
    const days = Math.max(trip.durationDays ?? 7, 7);

    fetch(`/api/weather?city=${encodeURIComponent(primaryCity)}&startDate=${trip.startDate}&days=${days}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.forecasts || !trip.startDate) return;
        const startDateObj = new Date(trip.startDate + 'T00:00:00Z');
        const byDay: Record<number, WeatherDay> = {};
        (data.forecasts as WeatherDay[]).forEach(f => {
          const fDate = new Date(f.date + 'T00:00:00Z');
          const diffDays = Math.round((fDate.getTime() - startDateObj.getTime()) / 86400000);
          const day = diffDays + 1;
          if (day >= 1) byDay[day] = f;
        });
        setWeatherByDay(byDay);
      })
      .catch(() => {});
  }, [trip]);

  const itinerary: ItineraryItem[] = useMemo(() => {
    if (!trip?.itineraryItems) return [];
    return [...trip.itineraryItems].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      const tbCmp = compareItineraryTimeBlock(a.timeBlock, b.timeBlock);
      if (tbCmp !== 0) return tbCmp;
      return a.order - b.order;
    });
  }, [trip]);

  const activities: Activity[] = useMemo(() => trip?.activities ?? [], [trip]);

  const filteredActivities = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activities.filter(a => {
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [activities, filterStatus, searchQuery]);

  const mapActivities = useMemo(() => buildMapActivities(activities, itinerary), [activities, itinerary]);

  const itineraryRoute = useMemo(() => {
    return itinerary.map(item => ({
      activityId: item.activity.id,
      day: item.day,
      lat: item.activity.lat,
      lng: item.activity.lng,
    }));
  }, [itinerary]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
        <div className="animate-spin rounded-full h-12 w-12 spinner-gradient"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="mb-2 text-2xl font-black text-stone-900">Something went wrong</h1>
        <p className="text-stone-500">Could not load this trip. Please try again later.</p>
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="mb-2 text-2xl font-black text-stone-900">Link not found</h1>
        <p className="text-stone-500">This trip share link has expired or been removed.</p>
      </div>
    );
  }

  const cities: string[] = JSON.parse(trip.cities);
  const typeIcons: Record<string, string> = { food: '🍽️', place: '🏛️', hotel: '🏨' };
  const schedule = [trip.startDate ? `Start ${trip.startDate}` : null, trip.durationDays ? `${trip.durationDays} days` : null].filter(Boolean).join(' · ');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f1e8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,_rgba(180,130,60,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(31,23,16,0.16),_transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 rounded-[2rem] border border-amber-100 bg-white/85 p-6 shadow-xl shadow-amber-900/10 backdrop-blur sm:p-8">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-[#fffaf2] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-800">
            🔗 Private shared dossier · read-only
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-5xl">{trip.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {cities.map(city => (
                  <span key={city} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900">
                    📍 {city}
                  </span>
                ))}
              </div>
              {schedule && <p className="mt-3 text-sm font-semibold text-stone-500">{schedule}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
              <div className="rounded-2xl border border-amber-100 bg-white p-3">
                <p className="text-2xl font-black text-stone-950">{activities.length}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">Ideas</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white p-3">
                <p className="text-2xl font-black text-amber-800">{itinerary.length}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">Planned</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white p-3">
                <p className="text-2xl font-black text-stone-950">{mapActivities.length}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">Mapped</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 flex w-fit gap-1 rounded-2xl border border-amber-200 bg-white/85 p-1 shadow-sm backdrop-blur">
          {(['itinerary', 'activities', 'map'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm font-black capitalize transition-all ${activeTab === tab ? 'bg-[#1f1710] text-amber-50 shadow-sm' : 'text-stone-600 hover:bg-amber-50 hover:text-amber-900'}`}
            >
              {tab === 'itinerary' ? '📋 Itinerary' : tab === 'activities' ? '💡 Activities' : '🗺️ Map'}
            </button>
          ))}
        </div>

        {activeTab === 'itinerary' && (
          <ItineraryView
            items={itinerary}
            schedule={{ startDate: trip.startDate, durationDays: trip.durationDays, itineraryVisibleDays: trip.itineraryVisibleDays }}
            weatherByDay={weatherByDay}
          />
        )}

        {activeTab === 'activities' && (
          <div>
            <div className="mb-5 flex flex-col gap-3 rounded-[1.5rem] border border-amber-100 bg-white/85 p-4 shadow-sm sm:flex-row">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="flex-1 rounded-2xl border border-amber-200 bg-[#fffaf2] px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
              <div className="flex gap-1 rounded-2xl bg-amber-50 p-1">
                {['all', 'approved'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`rounded-xl px-3 py-2 text-xs font-black capitalize transition-colors ${filterStatus === s ? 'bg-white text-amber-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {filteredActivities.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-amber-200 bg-white/70 py-16 text-center">
                <p className="font-bold text-stone-500">No activities found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredActivities.map(a => (
                  <article key={a.id} className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1f1710] text-2xl">{typeIcons[a.type] || '📌'}</span>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">Shared selection</p>
                        <h3 className="font-black text-stone-950">{a.title}</h3>
                        <p className="text-xs font-semibold text-stone-500">{a.city}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-stone-700">{a.description}</p>
                    {a.durationMinutes && (
                      <p className="mt-3 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-stone-500">⏱ ~{a.durationMinutes} min</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          mapActivities.length === 0 ? (
            <div className="rounded-[2rem] border border-amber-100 bg-white/75 py-16 text-center shadow-sm">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="font-bold text-stone-500">No activities on map yet</p>
            </div>
          ) : (
            <MapView
              activities={mapActivities}
              itineraryRoute={itineraryRoute}
              showItineraryRoute={itinerary.length > 0}
              itineraryDayFilter="all"
            />
          )
        )}
      </div>
    </div>
  );
}
