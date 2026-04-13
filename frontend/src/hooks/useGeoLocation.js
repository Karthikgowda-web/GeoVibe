import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Using Reva University coordinates for demo consistency.');
      setLocation({
        lat: 13.1144,
        lng: 77.6370
      });
      setLoading(false);
      return;
    }

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
    };

    const handleError = (err) => {
      setError('Using Reva University coordinates for demo consistency.');
      setLocation({
        lat: 13.1144,
        lng: 77.6370
      });
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, handleError);
  }, []);

  return { location, error, loading };
};
