/**
 * Global utility to resolve event image URLs from GridFS.
 * Ensures consistent streaming logic across the entire application.
 * 
 * @param {string} imageName - The filename stored in MongoDB GridFS.
 * @returns {string} The full streaming URL with a cache-buster.
 */
export const getEventImageUrl = (imageName) => {
  if (!imageName) return null;
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Data Integrity: Always append a cache-buster timestamp.
  // This ensures that if an organizer updates a photo, the changes
  // reflect immediately without manual browser cache clearing.
  return `${API_URL}/api/events/image/${imageName}?v=${Date.now()}`;
};
