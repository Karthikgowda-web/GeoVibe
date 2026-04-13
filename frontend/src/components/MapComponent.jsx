import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { getDistance } from '../utils/distance';
import { getEventImageUrl } from '../utils/imageUrl';

// Fix default marker icon paths (Leaflet + Vite compatibility)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─────────────────────────────────────────────────────────────────────────────
// GEOSPATIAL HEATMAP LAYER
// ─────────────────────────────────────────────────────────────────────────────
// This layer visualizes EVENT DENSITY across Bangalore - helping users identify
// "Tech Hubs": geographic clusters where hackathons, meetups, and workshops
// are concentrated. This is a data-driven UI pattern:
//   - Red zones = highest event density (prime tech corridors like Whitefield)
//   - Green zones = moderate activity
//   - Blue zones = sparse, emerging tech areas
// Interview insight: We use useMemo to avoid recomputing heatmap points on
// every render. The layer only redraws when the events array actually changes.
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Remove previous heatmap layer before re-drawing to prevent stacking
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create the Leaflet heatmap layer with tuned configuration:
    //   radius: 25  → each point influences a 25px radius (visible at 25km zoom)
    //   blur:   20  → smooth gradient edges for a professional look
    //   maxZoom: 10 → heatmap is most visible at city-wide zoom levels
    //   gradient:   → blue(cool) → green(moderate) → red(hot) density scale
    heatLayerRef.current = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 10,
      gradient: {
        0.1: '#3b82f6', // blue  - sparse events
        0.4: '#10b981', // green - moderate cluster
        0.7: '#f59e0b', // amber - high density
        1.0: '#ef4444', // red   - peak tech hub
      },
    }).addTo(map);

    // Cleanup: remove heatmap when component unmounts or events change
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
};

const LocationSelector = ({ isPosting, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (isPosting) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

const MapUpdater = ({ searchRadius, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (!searchRadius || !userLocation) return;
    let zoomLevel = 11;
    if (searchRadius === 50) zoomLevel = 9;
    if (searchRadius === 100) zoomLevel = 8;
    map.setView([userLocation.lat, userLocation.lng], zoomLevel, {
      animate: true,
      duration: 1,
    });
  }, [searchRadius, userLocation, map]);
  return null;
};

const MapComponent = ({ userLocation, events, isPosting, onMapClick, searchRadius = 15 }) => {
  if (!userLocation) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400">Loading map...</div>;
  }

  const center = [userLocation.lat, userLocation.lng];

  // ─── PERFORMANCE OPTIMISATION ───────────────────────────────────────────────
  // useMemo ensures the heatmap point array is only recomputed when `events`
  // changes. Each point is [lat, lng, intensity] where intensity is:
  //   - 2.0 for verified events (higher weight = hotter spot)
  //   - 1.0 for standard aggregated events
  // This rewards high-quality, organiser-verified data in the density map.
  const heatmapPoints = useMemo(() => {
    return events
      .filter(e => e.location?.coordinates?.length === 2)
      .map(e => [
        e.location.coordinates[1], // latitude
        e.location.coordinates[0], // longitude
        e.isVerified ? 2.0 : 1.0,  // intensity weight
      ]);
  }, [events]);

  return (
    <div className={`h-full w-full relative ${isPosting ? 'cursor-crosshair' : 'cursor-default'}`}>
      <MapContainer center={center} zoom={11} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap layer renders BELOW markers for clean layering order */}
        <HeatmapLayer points={heatmapPoints} />

        {/* User location marker + search radius ring */}
        <Marker position={center}>
          <Popup>You are here</Popup>
        </Marker>
        <Circle
          center={center}
          radius={searchRadius * 1000}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1 }}
        />
        <MapUpdater searchRadius={searchRadius} userLocation={userLocation} />

        {/* Individual event markers with popup details */}
        {events.map((event) => {
          const lat = event.location?.coordinates[1];
          const lng = event.location?.coordinates[0];
          if (!lat || !lng) return null;

          const distance = getDistance(userLocation.lat, userLocation.lng, lat, lng);
          const isNearby = distance <= 100;
          const distanceStr = distance >= 1000 ? (distance / 1000).toFixed(1) + 'km' : Math.round(distance) + 'm';

          return (
            <Marker key={event._id || event.title} position={[lat, lng]}>
              <Popup autoPan={false}>
                <div className="p-1 min-w-[160px]">
                  <h3 className="font-semibold text-blue-600 m-0 leading-tight">{event.title}</h3>
                  { (event.imageName || event.imageUrl) && (
                    <img src={getEventImageUrl(event.imageName) || event.imageUrl} alt="event" className="w-full h-20 object-cover rounded my-2 border border-gray-200" />
                  )}
                  <p className="text-xs text-gray-700 my-1 pb-1 line-clamp-2">{event.description}</p>
                  <p className="text-[10px] text-gray-500 mb-2 font-mono">Distance: {distanceStr}</p>
                  <button
                    disabled={!isNearby}
                    className={`w-full py-1 text-xs rounded transition font-medium ${isNearby ? 'bg-blue-100 text-blue-700 border border-blue-400 hover:bg-blue-600 hover:text-white cursor-pointer' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'}`}
                  >
                    {isNearby ? 'Check-in' : 'Must be <100m to Check-in'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <LocationSelector isPosting={isPosting} onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
