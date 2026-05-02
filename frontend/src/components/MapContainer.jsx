import React from 'react';
import { Map } from 'lucide-react';
import MapComponent from './MapComponent';
import { useSearch } from '../context/SearchContext';

const MapContainer = ({ events, location }) => {
  const { searchRadius } = useSearch();

  return (
    <div className="sticky top-28 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white flex flex-col">
      <div className="p-3 border-b border-gray-100 bg-white flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center font-bold text-gray-800">
          <Map className="mr-2 text-blue-600" size={18} /> Interactive Map
        </div>
      </div>
      <div className="flex-1 w-full bg-gray-100 relative z-0">
        <MapComponent 
          userLocation={location} 
          events={events} 
          isPosting={false} 
          onMapClick={() => {}} 
          searchRadius={searchRadius}
        />
      </div>
    </div>
  );
};

export default MapContainer;
