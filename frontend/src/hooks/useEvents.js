import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * @file useEvents.js
 * @description Custom hook for fetching and normalizing event data from the backend.
 * Handles nearby search, global fallback, and loading/error states.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useEvents = (location, radius, category) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGlobalFallback, setIsGlobalFallback] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    setIsGlobalFallback(false);

    try {
      let url = `${API_URL}/api/events/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radius}`;
      if (category !== 'All') {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await axios.get(url);
      const data = response.data.data;

      if (data && data.length > 0) {
        setEvents(data);
      } else {
        // Fallback to all/global events
        setIsGlobalFallback(true);
        const globalResponse = await axios.get(`${API_URL}/api/events/all`);
        setEvents(globalResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Falling back to global list.');
      // Attempt global fallback even on error
      try {
        const fallbackResponse = await axios.get(`${API_URL}/api/events/all`);
        setEvents(fallbackResponse.data.data || []);
        setIsGlobalFallback(true);
      } catch (innerErr) {
        setError('Complete failure to load events.');
      }
    } finally {
      setLoading(false);
    }
  }, [location, radius, category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, isGlobalFallback, refresh: fetchEvents };
};
