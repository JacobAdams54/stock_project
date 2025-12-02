import { useState, useCallback } from 'react';

/**
 * Stock forecast prediction result from the API
 */
interface ForecastResult {
  direction: 'up' | 'down';
  confidence: number;
  forecast: number[];
  meta: {
    model: string;
    ticker: string;
    horizon: number;
    window_used: number;
  };
}

/**
 * Parameters for fetching a stock forecast
 */
interface ForecastParams {
  ticker: string;
  horizon: number; // 1-60 days
  modelType?: 'arimax' | 'dl'; // Default to 'arimax'
}

/**
 * Return type for the useStockForecast hook
 */
interface UseStockForecastReturn {
  forecast: ForecastResult | null;
  loading: boolean;
  error: string | null;
  // eslint-disable-next-line no-unused-vars
  fetchForecast: (params: ForecastParams) => Promise<void>;
  reset: () => void;
}

const API_BASE_URL =
  'https://vercel-hssjpxi33-julian-varas-projects.vercel.app';

/**
 * Custom hook for fetching stock price forecasts using ML models
 *
 * @returns {UseStockForecastReturn} Forecast data, loading state, and fetch function
 *
 * @example
 * ```tsx
 * const { forecast, loading, error, fetchForecast } = useStockForecast();
 *
 * const handlePredict = async () => {
 *   await fetchForecast({ ticker: 'AAPL', horizon: 5 });
 * };
 * ```
 */
export function useStockForecast(): UseStockForecastReturn {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches a stock forecast from the prediction API
   *
   * @param {ForecastParams} params - Forecast parameters
   * @throws {Error} If the API request fails
   */
  const fetchForecast = useCallback(
    async ({ ticker, horizon, modelType = 'arimax' }: ForecastParams) => {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          modelType === 'arimax' ? '/predict/arimax' : '/predict/dl';

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticker: ticker.toUpperCase(),
            horizon,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ForecastResult = await response.json();
        setForecast(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch forecast';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Resets the hook state to initial values
   */
  const reset = useCallback(() => {
    setForecast(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    forecast,
    loading,
    error,
    fetchForecast,
    reset,
  };
}
