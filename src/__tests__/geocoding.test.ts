import { geocodeWithGoogleMaps } from '@/lib/geocoding';

describe('geocodeWithGoogleMaps', () => {
  const originalEnv = process.env.GOOGLE_MAPS_API_KEY;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = originalEnv;
    global.fetch = originalFetch;
  });

  it('uses a request timeout and returns null when fetch rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchMock = jest.fn().mockRejectedValue(new TypeError('fetch failed'));
    global.fetch = fetchMock as typeof fetch;

    const result = await geocodeWithGoogleMaps('Louvre Museum, Paris');

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://maps.googleapis.com/maps/api/geocode/json'),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(consoleError).toHaveBeenCalledWith('Google Maps geocoding request failed', expect.any(TypeError));
    consoleError.mockRestore();
  });
});
