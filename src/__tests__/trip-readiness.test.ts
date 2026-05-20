import { computeTripReadiness } from '@/lib/trip-readiness';

describe('computeTripReadiness', () => {
  it('starts in briefing when destinations exist but schedule is missing', () => {
    const readiness = computeTripReadiness({
      destinationCount: 2,
      hasSchedule: false,
      activitiesCount: 0,
      approvedCount: 0,
      itineraryItemsCount: 0,
      mappedArrangedCount: 0,
      hasShareLink: false,
    });

    expect(readiness.score).toBe(10);
    expect(readiness.stage).toBe('Briefing');
    expect(readiness.nextStep).toBe('Set dates or trip duration so the itinerary can be paced with confidence.');
  });

  it('moves into curation once the trip frame is set but no activities exist', () => {
    const readiness = computeTripReadiness({
      destinationCount: 1,
      hasSchedule: true,
      activitiesCount: 0,
      approvedCount: 0,
      itineraryItemsCount: 0,
      mappedArrangedCount: 0,
      hasShareLink: false,
    });

    expect(readiness.score).toBe(25);
    expect(readiness.stage).toBe('Curation');
    expect(readiness.nextStep).toBe('Curate signature experiences before shaping the day-by-day flow.');
  });

  it('prioritizes arranging approved activities when the shortlist is ready', () => {
    const readiness = computeTripReadiness({
      destinationCount: 1,
      hasSchedule: true,
      activitiesCount: 6,
      approvedCount: 4,
      itineraryItemsCount: 0,
      mappedArrangedCount: 0,
      hasShareLink: false,
    });

    expect(readiness.score).toBe(60);
    expect(readiness.stage).toBe('Flow');
    expect(readiness.nextStep).toBe('Arrange approved experiences into a graceful day-by-day rhythm.');
  });

  it('reaches guest-ready only when the dossier is shared after routing is mapped', () => {
    const readiness = computeTripReadiness({
      destinationCount: 3,
      hasSchedule: true,
      activitiesCount: 10,
      approvedCount: 8,
      itineraryItemsCount: 8,
      mappedArrangedCount: 8,
      hasShareLink: true,
    });

    expect(readiness.score).toBe(100);
    expect(readiness.stage).toBe('Guest-ready');
    expect(readiness.nextStep).toBe('Ready for final concierge review and traveler handoff.');
    expect(readiness.checklist.every((item) => item.complete)).toBe(true);
  });
});
