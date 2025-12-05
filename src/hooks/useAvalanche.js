/**
 * Custom hook for fetching and caching avalanche forecast data
 * Uses React Query for automatic caching and deduplication
 */
import { useQuery } from '@tanstack/react-query';
import { getClosestAvalancheForecast } from '../services/avalancheApi';

/**
 * Fetch avalanche forecast for coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} options - Query options
 * @returns {Object} Query result with avalanche forecast data
 */
export const useAvalancheForecast = (lat, lon, options = {}) => {
    return useQuery({
        queryKey: ['avalanche', lat, lon],
        queryFn: async () => {
            if (!lat || !lon) return null;
            return await getClosestAvalancheForecast(lat, lon);
        },
        staleTime: 60 * 60 * 1000, // 1 hour - avalanche forecasts update less frequently
        cacheTime: 2 * 60 * 60 * 1000, // 2 hours
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!(lat && lon) && (options.enabled !== false),
    });
};

/**
 * Prefetch avalanche forecast data
 * @param {QueryClient} queryClient - React Query client instance
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export const prefetchAvalancheForecast = async (queryClient, lat, lon) => {
    if (!lat || !lon) return;

    await queryClient.prefetchQuery({
        queryKey: ['avalanche', lat, lon],
        queryFn: async () => {
            return await getClosestAvalancheForecast(lat, lon);
        },
        staleTime: 60 * 60 * 1000,
    });
};
