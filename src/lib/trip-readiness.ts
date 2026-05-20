export type TripReadinessStage = 'Briefing' | 'Curation' | 'Flow' | 'Logistics' | 'Guest-ready';

export interface TripReadinessInput {
  destinationCount: number;
  hasSchedule: boolean;
  activitiesCount: number;
  approvedCount: number;
  itineraryItemsCount: number;
  mappedArrangedCount: number;
  hasShareLink: boolean;
}

export interface TripReadinessChecklistItem {
  id: string;
  label: string;
  complete: boolean;
  detail: string;
}

export interface TripReadinessResult {
  score: number;
  stage: TripReadinessStage;
  nextStep: string;
  checklist: TripReadinessChecklistItem[];
}

export function computeTripReadiness(input: TripReadinessInput): TripReadinessResult {
  const hasDestination = input.destinationCount > 0;
  const hasActivities = input.activitiesCount > 0;
  const hasApproved = input.approvedCount > 0;
  const hasItinerary = input.itineraryItemsCount > 0;
  const hasMappedRoute = input.mappedArrangedCount > 0;

  const checklist: TripReadinessChecklistItem[] = [
    {
      id: 'trip-frame',
      label: 'Trip frame',
      complete: hasDestination && input.hasSchedule,
      detail: 'Destinations plus dates or duration are defined.',
    },
    {
      id: 'signature-shortlist',
      label: 'Signature shortlist',
      complete: hasActivities,
      detail: 'Curated experiences exist for traveler review.',
    },
    {
      id: 'curated-approvals',
      label: 'Curated approvals',
      complete: hasApproved,
      detail: 'The strongest experiences have been approved.',
    },
    {
      id: 'day-flow',
      label: 'Day flow',
      complete: hasItinerary,
      detail: 'Approved stops are arranged into itinerary days.',
    },
    {
      id: 'route-confidence',
      label: 'Route confidence',
      complete: hasMappedRoute,
      detail: 'Mapped stops support practical movement planning.',
    },
    {
      id: 'shared-dossier',
      label: 'Shared dossier',
      complete: input.hasShareLink,
      detail: 'A public read-only dossier is ready for handoff.',
    },
  ];

  const score = [
    hasDestination ? 10 : 0,
    input.hasSchedule ? 15 : 0,
    hasActivities ? 20 : 0,
    hasApproved ? 15 : 0,
    hasItinerary ? 20 : 0,
    hasMappedRoute ? 10 : 0,
    input.hasShareLink ? 10 : 0,
  ].reduce((sum, points) => sum + points, 0);

  if (!input.hasSchedule) {
    return {
      score,
      stage: 'Briefing',
      nextStep: 'Set dates or trip duration so the itinerary can be paced with confidence.',
      checklist,
    };
  }

  if (!hasActivities) {
    return {
      score,
      stage: 'Curation',
      nextStep: 'Curate signature experiences before shaping the day-by-day flow.',
      checklist,
    };
  }

  if (!hasApproved) {
    return {
      score,
      stage: 'Curation',
      nextStep: 'Approve the best-fit experiences and remove distractions from the shortlist.',
      checklist,
    };
  }

  if (!hasItinerary) {
    return {
      score,
      stage: 'Flow',
      nextStep: 'Arrange approved experiences into a graceful day-by-day rhythm.',
      checklist,
    };
  }

  if (!hasMappedRoute) {
    return {
      score,
      stage: 'Logistics',
      nextStep: 'Confirm mapped route confidence before sharing the dossier.',
      checklist,
    };
  }

  if (!input.hasShareLink) {
    return {
      score,
      stage: 'Logistics',
      nextStep: 'Generate a read-only share link for traveler handoff.',
      checklist,
    };
  }

  return {
    score,
    stage: 'Guest-ready',
    nextStep: 'Ready for final concierge review and traveler handoff.',
    checklist,
  };
}
