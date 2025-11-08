import { useState, useEffect } from "react";

/**
 * Custom hook for data fetching with loading and error states
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {any} initialData - Initial data state
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {object} Data, loading, error states and refetch function
 */
export const useFetch = (
  fetchFunction,
  initialData = null,
  dependencies = []
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err.message || "An error occurred");
      console.error("useFetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch, setData };
};

export default useFetch;
