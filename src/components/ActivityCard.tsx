'use client';

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

interface ActivityCardProps {
  activity: Activity;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

const timeIcons: Record<string, string> = {
  morning: '🌅',
  lunch: '🌞',
  afternoon: '🌤',
  dinner: '🌙',
  night: '🌃',
};

const typeIcons: Record<string, string> = {
  food: '🍽️',
  place: '🏛️',
  hotel: '🏨',
};

const statusStyles: Record<string, { card: string; badge: string; rail: string }> = {
  pending: {
    card: 'border-amber-200 bg-amber-50/70 shadow-amber-100/50',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    rail: 'from-amber-400 to-orange-400',
  },
  approved: {
    card: 'border-emerald-200 bg-emerald-50/70 shadow-emerald-100/50',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rail: 'from-emerald-400 to-teal-400',
  },
  rejected: {
    card: 'border-rose-200 bg-rose-50/70 shadow-rose-100/50',
    badge: 'bg-rose-100 text-rose-800 ring-rose-200',
    rail: 'from-rose-400 to-red-400',
  },
};

export default function ActivityCard({ activity, onApprove, onReject, onDelete, canEdit = true }: ActivityCardProps) {
  const placeQuery = [activity.title.trim(), activity.city.trim()].filter(Boolean).join(', ');
  const mapsQuery = encodeURIComponent(placeQuery || `${activity.lat},${activity.lng}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const statusStyle = statusStyles[activity.status] ?? {
    card: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
    rail: 'from-slate-300 to-slate-400',
  };

  return (
    <article className={`group relative overflow-hidden rounded-[1.5rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${statusStyle.card}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${statusStyle.rail}`} />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200/70">
            {typeIcons[activity.type] || '📌'}
          </span>
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Planning brief</p>
            <h3 className="text-lg font-black leading-snug text-slate-950">{activity.title}</h3>
            <span className="mt-1 block text-xs font-semibold text-slate-500">{activity.city} · {timeIcons[activity.suggestedTime]} {activity.suggestedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${statusStyle.badge}`}>
            {activity.status}
          </span>
          {onDelete && canEdit && (
            <button
              onClick={() => onDelete(activity.id)}
              aria-label="Delete activity"
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-white/82 p-4 ring-1 ring-white/80">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Experience</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{activity.description}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">Why it fits</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">💡 {activity.reason}</p>
        </div>
        {activity.durationMinutes && (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-black uppercase tracking-wide text-slate-400">Estimated stay</span>
            <span className="font-bold">⏱ ~{activity.durationMinutes} minutes</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-50"
          aria-label="Open in Google Maps"
        >
          📍 Open in Google Maps
        </a>

        {activity.status === 'pending' && canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(activity.id)}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => onReject(activity.id)}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
