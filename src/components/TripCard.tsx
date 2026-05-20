'use client';

import Link from 'next/link';
import { useState } from 'react';

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

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
}

function safeParseCities(citiesJson: string): string[] {
  try {
    const cities = JSON.parse(citiesJson) as unknown;
    return Array.isArray(cities) ? cities.filter((city): city is string => typeof city === 'string') : [];
  } catch {
    return [];
  }
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [copied, setCopied] = useState(false);
  const cities = safeParseCities(trip.cities);
  const createdDate = formatDate(trip.createdAt);
  const activitiesCount = trip.counts?.activitiesCount ?? 0;
  const scheduledCount = trip.counts?.itineraryItemsCount ?? 0;
  const plannedPercent = activitiesCount > 0 ? Math.round((scheduledCount / activitiesCount) * 100) : 0;
  const tripUrl = `/trips/${trip.id}`;

  async function handleCopyLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await navigator.clipboard?.writeText(`${origin}${tripUrl}`);
    setCopied(true);
  }

  return (
    <article className="group rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/70 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-500">
            {cities.length > 0 ? cities.map((city) => (
              <span key={city} className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
                {city}
              </span>
            )) : (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">目的地未定</span>
            )}
          </div>

          <h3 className="mt-4 font-serif text-2xl font-bold tracking-tight text-stone-950">
            {trip.name}
          </h3>

          <div className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">日期</p>
              <p className="mt-1 font-bold text-stone-900">{trip.startDate ?? '日期未定'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">時長</p>
              <p className="mt-1 font-bold text-stone-900">{trip.durationDays ? `${trip.durationDays} 天` : '開放天數'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">建立於</p>
              <p className="mt-1 font-bold text-stone-900">{createdDate}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>規劃進度</span>
              <span>{activitiesCount > 0 ? `${scheduledCount} / ${activitiesCount} 已排程` : '尚未建立活動'}</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${trip.name} 規劃進度`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={plannedPercent}
              className="h-2 overflow-hidden rounded-full bg-stone-100"
            >
              <div className="h-full rounded-full bg-stone-900 transition-all" style={{ width: `${plannedPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Link
            href={tripUrl}
            aria-label={`開啟 ${trip.name}`}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-stone-700"
          >
            開啟
          </Link>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label={`複製 ${trip.name} 連結`}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            {copied ? '已複製' : '複製連結'}
          </button>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50">
              更多
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-44 rounded-2xl border border-stone-200 bg-white p-2 text-xs text-stone-500 shadow-xl">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(trip.id)}
                  aria-label={`刪除 ${trip.name}`}
                  className="w-full rounded-xl px-3 py-2 text-left font-bold text-rose-700 transition hover:bg-rose-50"
                >
                  刪除旅程
                </button>
              ) : (
                <Link href={tripUrl} className="block rounded-xl px-3 py-2 font-bold text-stone-900 transition hover:bg-stone-50">
                  前往設定
                </Link>
              )}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}
