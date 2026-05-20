export interface PortfolioTripSummary {
  id: string;
  name: string;
  createdAt: string;
  startDate?: string | null;
  durationDays?: number | null;
  counts?: {
    activitiesCount: number;
    itineraryItemsCount: number;
  };
}

export interface PortfolioPrioritySummary {
  tripId: string;
  tripName: string;
  label: string;
  detail: string;
  actionLabel: string;
  priority: number;
}

function hasTripFrame(trip: PortfolioTripSummary): boolean {
  const hasStartDate = typeof trip.startDate === 'string' && trip.startDate.trim().length > 0;
  const hasDuration = typeof trip.durationDays === 'number' && trip.durationDays > 0;
  return hasStartDate || hasDuration;
}

function getTripPriority(trip: PortfolioTripSummary): PortfolioPrioritySummary {
  const activitiesCount = trip.counts?.activitiesCount ?? 0;
  const itineraryItemsCount = trip.counts?.itineraryItemsCount ?? 0;

  if (!hasTripFrame(trip)) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      label: '設定旅程日期',
      detail: '補上日期或天數，行程節奏、天氣與路線判斷才有可信基準。',
      actionLabel: '開啟',
      priority: 1,
    };
  }

  if (activitiesCount === 0) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      label: '建立靈感清單',
      detail: '先放入代表目的地的餐廳、文化、住宿與安靜奢華時刻。',
      actionLabel: '開始整理',
      priority: 2,
    };
  }

  if (itineraryItemsCount === 0) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      label: '排出每日節奏',
      detail: '先把已確認的體驗排成順暢的一日節奏，再處理路線細節。',
      actionLabel: '看行程',
      priority: 3,
    };
  }

  if (itineraryItemsCount < activitiesCount) {
    const remainingCount = activitiesCount - itineraryItemsCount;
    return {
      tripId: trip.id,
      tripName: trip.name,
      label: '安排剩餘靈感',
      detail: `還有 ${remainingCount} 個靈感需要放進日期與節奏，旅程才會接近可交付狀態。`,
      actionLabel: '調整節奏',
      priority: 4,
    };
  }

  return {
    tripId: trip.id,
    tripName: trip.name,
    label: '最後檢查',
    detail: '交付前檢查每日節奏、地圖信心與分享設定。',
    actionLabel: '檢查',
    priority: 5,
  };
}

function getCreatedAtTime(trip: PortfolioTripSummary): number {
  const time = new Date(trip.createdAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function summarizePortfolioPriority(trips: PortfolioTripSummary[]): PortfolioPrioritySummary | null {
  if (trips.length === 0) return null;

  return trips
    .map(getTripPriority)
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;

      const tripA = trips.find((trip) => trip.id === a.tripId);
      const tripB = trips.find((trip) => trip.id === b.tripId);
      return getCreatedAtTime(tripB ?? trips[0]) - getCreatedAtTime(tripA ?? trips[0]);
    })[0];
}
