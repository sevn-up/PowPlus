/**
 * Custom hook for fetching and caching weather data
 * Uses React Query for automatic caching, deduplication, and stale data management
 */
import { useQuery } from '@tanstack/react-query';
import { getCoordinates, getWeather } from '../services/weatherApi';
import { getLocationByName } from '../data/locationData';

/**
 * Fetch weather data for a location
 * @param {string} townName - Name of the town/location
 * @returns {Object} Query result with weather data, loading state, and error
 */
export const useWeather = (townName) => {
  return useQuery({
    queryKey: ['weather', townName],
    queryFn: async () => {
      // Check if we have this location in our database
      const locationData = getLocationByName(townName);

      let coords;
      if (locationData) {
        // Use hardcoded coordinates from our database
        coords = {
          lat: locationData.coordinates.lat,
          lon: locationData.coordinates.lon,
          name: locationData.displayName || locationData.name,
          country: 'Canada',
          elevation: locationData.elevation.summit,
        };
      } else {
        // Fall back to geocoding API for custom locations
        coords = await getCoordinates(townName);
      }

      // Fetch weather data
      const weatherData = await getWeather(coords.lat, coords.lon);

      return {
        ...weatherData,
        locationName: coords.name,
        country: coords.country,
        elevation: coords.elevation,
        coordinates: { lat: coords.lat, lon: coords.lon },
        locationData: locationData || null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data won't refetch unless older than this
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache even when unused
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    retry: 2, // Retry failed requests twice
    enabled: !!townName, // Only run query if townName is provided
  });
};

/**
 * Prefetch weather data for a location
 * Useful for preloading data when user hovers over a location
 * @param {QueryClient} queryClient - React Query client instance
 * @param {string} townName - Name of the town/location
 */
export const prefetchWeather = async (queryClient, townName) => {
  await queryClient.prefetchQuery({
    queryKey: ['weather', townName],
    queryFn: async () => {
      const locationData = getLocationByName(townName);
      let coords;

      if (locationData) {
        coords = {
          lat: locationData.coordinates.lat,
          lon: locationData.coordinates.lon,
          name: locationData.displayName || locationData.name,
          country: 'Canada',
          elevation: locationData.elevation.summit,
        };
      } else {
        coords = await getCoordinates(townName);
      }

      const weatherData = await getWeather(coords.lat, coords.lon);
      return {
        ...weatherData,
        locationName: coords.name,
        country: coords.country,
        elevation: coords.elevation,
        coordinates: { lat: coords.lat, lon: coords.lon },
        locationData: locationData || null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
