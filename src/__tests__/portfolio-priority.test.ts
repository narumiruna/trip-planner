import { summarizePortfolioPriority } from '@/lib/portfolio-priority';

describe('summarizePortfolioPriority', () => {
  it('returns null when there are no trips to triage', () => {
    expect(summarizePortfolioPriority([])).toBeNull();
  });

  it('prioritizes trips that still need dates or duration', () => {
    const priority = summarizePortfolioPriority([
      {
        id: 'trip-1',
        name: 'Paris Atelier',
        createdAt: '2026-05-01T00:00:00.000Z',
        startDate: null,
        durationDays: null,
        counts: { activitiesCount: 4, itineraryItemsCount: 4 },
      },
      {
        id: 'trip-2',
        name: 'Tokyo Dining Week',
        createdAt: '2026-05-02T00:00:00.000Z',
        startDate: '2026-06-01',
        durationDays: 5,
        counts: { activitiesCount: 0, itineraryItemsCount: 0 },
      },
    ]);

    expect(priority).toEqual({
      tripId: 'trip-1',
      tripName: 'Paris Atelier',
      label: '設定旅程日期',
      detail: '補上日期或天數，行程節奏、天氣與路線判斷才有可信基準。',
      actionLabel: '開啟',
      priority: 1,
    });
  });

  it('guides curation before scheduling when a framed trip has no ideas', () => {
    const priority = summarizePortfolioPriority([
      {
        id: 'trip-1',
        name: 'Kyoto Retreat',
        createdAt: '2026-05-01T00:00:00.000Z',
        startDate: '2026-06-01',
        durationDays: 4,
        counts: { activitiesCount: 0, itineraryItemsCount: 0 },
      },
    ]);

    expect(priority?.label).toBe('建立靈感清單');
    expect(priority?.detail).toBe('先放入代表目的地的餐廳、文化、住宿與安靜奢華時刻。');
    expect(priority?.priority).toBe(2);
  });

  it('surfaces unscheduled ideas as a flow priority', () => {
    const priority = summarizePortfolioPriority([
      {
        id: 'trip-1',
        name: 'Rome Weekend',
        createdAt: '2026-05-01T00:00:00.000Z',
        startDate: '2026-06-01',
        durationDays: 3,
        counts: { activitiesCount: 7, itineraryItemsCount: 4 },
      },
    ]);

    expect(priority?.label).toBe('安排剩餘靈感');
    expect(priority?.detail).toBe('還有 3 個靈感需要放進日期與節奏，旅程才會接近可交付狀態。');
    expect(priority?.priority).toBe(4);
  });
});
