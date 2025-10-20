import { useState, useEffect } from 'react';

/**
 * Stock data returned from API
 * @interface StockData
 */
interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  priceHistory: Array<{ date: string; price: number }>;
  // TODO: Add more fields as you discover API response
}

/**
 * Custom hook for fetching stock market data
 *
 * @description
 * Fetches real-time stock information from yfinance2 API.
 * Handles loading states, errors, and automatic refetching when symbol changes.
 *
 * @param {string | undefined} symbol - Stock ticker symbol (e.g., "MSFT", "AAPL")
 * @returns {Object} Stock data state object
 * @returns {StockData | null} returns.data - Stock data or null if not loaded
 * @returns {boolean} returns.loading - True while fetching data
 * @returns {Error | null} returns.error - Error object if fetch failed
 *
 * @example
 * ```tsx
 * const StockPage = () => {
 *   const { data, loading, error } = useStockData('MSFT');
 *
 *   if (loading) return <CircularProgress />;
 *   if (error) return <Alert severity="error">{error.message}</Alert>;
 *   if (!data) return <Alert severity="warning">No data found</Alert>;
 *
 *   return <div>{data.name}: ${data.currentPrice}</div>;
 * };
 * ```
 */
export const useStockData = (symbol: string | undefined) => {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implement firestore API call
        // TODO: Implement yfinance2 API call backup
        // TODO: Implement caching to avoid redundant requests

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

        const mockData: StockData = {
          symbol: symbol,
          name: `${symbol} Inc.`,
          currentPrice: 174.12,
          change: 2.34,
          changePercent: 1.36,
          priceHistory: [
            { date: '2024-10-13', price: 170.5 },
            { date: '2024-10-14', price: 171.2 },
            { date: '2024-10-15', price: 169.8 },
            { date: '2024-10-16', price: 172.4 },
            { date: '2024-10-17', price: 173.1 },
            { date: '2024-10-18', price: 171.78 },
            { date: '2024-10-19', price: 174.12 },
          ],
        };

        setData(mockData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch stock data')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  return { data, loading, error };
};
