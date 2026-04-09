import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDistance } from '../utils/distance';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
      duration: 1
    });
  }, [searchRadius, userLocation, map]);
  return null;
};

const MapComponent = ({ userLocation, events, isPosting, onMapClick, searchRadius = 15 }) => {
  if (!userLocation) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400">Loading map...</div>;
  }

  const center = [userLocation.lat, userLocation.lng];

  return (
    <div className={`h-full w-full relative ${isPosting ? 'cursor-crosshair' : 'cursor-default'}`}>
      <MapContainer center={center} zoom={11} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <Marker position={center}>
          <Popup>You are here</Popup>
        </Marker>
        <Circle 
          center={center} 
          radius={searchRadius * 1000} 
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 1 }} 
        />
        <MapUpdater searchRadius={searchRadius} userLocation={userLocation} />

        {events.map((event) => {
          const lat = event.location?.coordinates[1];
          const lng = event.location?.coordinates[0];
          if (lat && lng) {
            const distance = getDistance(userLocation.lat, userLocation.lng, lat, lng);
            const isNearby = distance <= 100;
            const distanceStr = distance >= 1000 ? (distance / 1000).toFixed(1) + 'km' : Math.round(distance) + 'm';

            return (
              <Marker key={event._id || event.title} position={[lat, lng]}>
                <Popup autoPan={false}>
                  <div className="p-1 min-w-[160px]">
                    <h3 className="font-semibold text-blue-600 m-0 leading-tight">{event.title}</h3>
                    {event.imageUrl && <img src={event.imageUrl} alt="event" className="w-full h-20 object-cover rounded my-2 border border-gray-200" />}
                    <p className="text-xs text-gray-700 my-1 pb-1">{event.description}</p>
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
          }
          return null;
        })}

        <LocationSelector isPosting={isPosting} onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
