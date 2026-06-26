jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

jest.mock('@/lib/llm', () => ({
  fillActivityDetails: jest.fn(),
  generateChatActionPlan: jest.fn(),
  generateActivities: jest.fn(),
  organizeItinerary: jest.fn(),
}));

jest.mock('@/lib/geocoding', () => ({
  geocodeWithGoogleMaps: jest.fn(),
}));

import { planTripActions, validateChatAction, validateChatActionPlan } from '@/lib/chatbot';
import * as chatbotModule from '@/lib/chatbot';
import { generateChatActionPlan } from '@/lib/llm';

const mockGenerateChatActionPlan = generateChatActionPlan as jest.Mock;

describe('chatbot action validation with activity naming', () => {
  it('exposes activity create suggestion helper', () => {
    expect('suggestActivityCreateActionFromTitle' in chatbotModule).toBe(true);
  });

  it('accepts activity.create payload with activityType', () => {
    const action = validateChatAction({
      type: 'activity.create',
      title: 'Eiffel Tower',
      description: 'Landmark',
      city: 'Paris',
      activityType: 'place',
    });

    expect(action).toMatchObject({
      type: 'activity.create',
      title: 'Eiffel Tower',
      activityType: 'place',
    });
  });

  it('rejects activity.create payload with unsupported legacy type alias field', () => {
    expect(() => validateChatAction({
      type: 'activity.create',
      title: 'Eiffel Tower',
      description: 'Landmark',
      city: 'Paris',
      legacyType: 'place',
    })).toThrow('Unsupported field "legacyType"');
  });

  it('rejects legacy create action payload', () => {
    expect(() => validateChatAction({
      type: 'legacy.create',
      title: 'Louvre Museum',
      description: 'Museum',
      city: 'Paris',
      legacyType: 'place',
    })).toThrow('Unsupported action type.');
  });

  it('accepts itinerary.addActivity with activityId', () => {
    const action = validateChatAction({
      type: 'itinerary.addActivity',
      activityId: 'a-1',
      day: 2,
      timeBlock: 'afternoon',
      order: 1,
    });

    expect(action).toEqual({
      type: 'itinerary.addActivity',
      activityId: 'a-1',
      day: 2,
      timeBlock: 'afternoon',
      order: 1,
    });
  });

  it('rejects legacy itinerary.add action payload', () => {
    expect(() => validateChatAction({
      type: 'itinerary.addLegacy',
      activityId: 'x-legacy',
      day: 1,
      timeBlock: 'morning',
    })).toThrow('Unsupported action type.');
  });

  it('rejects out-of-range activity.update coordinates', () => {
    expect(() => validateChatAction({
      type: 'activity.update',
      activityId: 'a-1',
      lat: 999,
      lng: 999,
    })).toThrow('Invalid coordinates.');
  });

  it('requires activityId for activity.update', () => {
    expect(() => validateChatAction({ type: 'activity.update', title: 'new title' }))
      .toThrow('activity.update requires activityId.');
  });

  it('returns an empty plan when LLM actionPlan is malformed', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGenerateChatActionPlan.mockResolvedValueOnce({ summary: 'Will do something', actionPlan: { type: 'activity.generate' } });

    await expect(planTripActions('plan my trip', { tripId: 'trip-1', userId: 'u-1' }))
      .resolves.toEqual({ summary: 'No executable actions identified.', actionPlan: [] });

    consoleError.mockRestore();
  });

  it('rejects legacy action plan item types', () => {
    expect(() => validateChatActionPlan([
      { type: 'legacy.generate', city: 'Paris' },
      { type: 'legacy.delete', activityId: 'x-1' },
    ])).toThrow('Unsupported action type.');
  });
});
