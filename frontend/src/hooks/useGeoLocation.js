import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Using default location (Bangalore) to show nearby events.');
      setLocation({
        lat: 12.9716,
        lng: 77.5946
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
      setError('Using default location (Bangalore) to show nearby events.');
      setLocation({
        lat: 12.9716,
        lng: 77.5946
      });
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, handleError);
  }, []);

  return { location, error, loading };
};
