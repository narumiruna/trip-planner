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

const timeCopy: Record<string, string> = {
  morning: '上午',
  lunch: '午餐',
  afternoon: '下午',
  dinner: '晚餐',
  night: '夜間',
};

const statusCopy: Record<string, { label: string; dot: string }> = {
  pending: { label: '待審核', dot: 'bg-[#7a3f18]' },
  approved: { label: '已核准', dot: 'bg-emerald-500' },
  rejected: { label: '已排除', dot: 'bg-stone-400' },
};

export default function ActivityCard({ activity, onApprove, onReject, onDelete, canEdit = true }: ActivityCardProps) {
  const placeQuery = [activity.title.trim(), activity.city.trim()].filter(Boolean).join(', ');
  const mapsQuery = encodeURIComponent(placeQuery || `${activity.lat},${activity.lng}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const status = statusCopy[activity.status] ?? { label: activity.status, dot: 'bg-stone-400' };

  return (
    <article className="group rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/70">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-stone-50 text-2xl ring-1 ring-stone-200">
            {typeIcons[activity.type] || '📌'}
          </span>
          <div>
            <h3 className="text-lg font-black leading-snug text-stone-950">{activity.title}</h3>
            <span className="mt-1 block text-xs font-semibold text-stone-500">{activity.city} · {timeIcons[activity.suggestedTime]} {timeCopy[activity.suggestedTime] ?? activity.suggestedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {onDelete && canEdit && (
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              aria-label="刪除活動"
              className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-4">
        <p className="text-sm leading-6 text-stone-700">{activity.description}</p>
        <p className="mt-3 text-sm leading-6 text-stone-600">💡 {activity.reason}</p>
        {activity.durationMinutes && (
          <p className="mt-3 text-xs font-bold text-stone-500">⏱ 約 {activity.durationMinutes} 分鐘</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
          aria-label="在 Google Maps 開啟"
        >
          📍 Google Maps
        </a>

        {activity.status === 'pending' && canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onApprove(activity.id)}
              className="rounded-full bg-[#7a3f18] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#653314]"
            >
              ✓ 核准
            </button>
            <button
              type="button"
              onClick={() => onReject(activity.id)}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-50"
            >
              排除
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
