import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useDebounce } from '../hooks/useDebounce';
import { Compass, Search, Map as MapIcon, Loader2, Sparkles } from 'lucide-react';

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { location, loading: geoLoading } = useGeoLocation();

  useEffect(() => {
    const fetchDiscoverEvents = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Fetch all verified events (which includes our news, meetups, etc)
        const response = await axios.get(`${API_URL}/api/events/all`);
        
        // Filter for "Discover" specific categories: Meetups, Workshops, Cultural, News
        const discoverItems = response.data.data.filter(evt => 
          ['Meetups', 'Workshops', 'Cultural Events', 'News & Alerts'].includes(evt.category)
        );
        
        setEvents(discoverItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching discover events:', err);
        setError('Failed to load discovery feed.');
        setLoading(false);
      }
    };

    fetchDiscoverEvents();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-brand-primary font-bold text-sm uppercase tracking-widest mb-1">
                <Compass size={16} className="mr-2 animate-spin-slow" />
                Explore GeoVibe
              </div>
              <h1 className="text-3xl font-black text-gray-900">Discover Mode</h1>
              <p className="text-gray-500 text-sm mt-1">Live news, workshops, and meetups happening in Bengaluru.</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto items-center">
               <div className="relative mr-4 hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search discovery..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border-transparent rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand-primary/20 w-48 transition-all"
                  />
               </div>
               <button className="flex-1 px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-brand-primary flex items-center justify-center">
                 <Sparkles size={16} className="mr-2" /> Global Feed
               </button>
               <button className="flex-1 px-4 py-2 text-gray-500 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-200 transition">
                 <MapIcon size={16} className="mr-2" /> Heatmap
               </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {(loading || geoLoading) ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Loader2 size={48} className="animate-spin text-brand-primary mb-4" />
               <p className="font-bold">Syncing live city pulses...</p>
            </div>
          ) : (() => {
            const filtered = events.filter(evt => {
              const term = searchTerm.toLowerCase().trim();
              if (!term) return true;
              return evt.title.toLowerCase().includes(term) || evt.category.toLowerCase().includes(term);
            });
            
            return filtered.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((evt, idx) => (
                  <EventCard 
                    key={evt._id || idx} 
                    event={evt} 
                    index={idx} 
                    location={location} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search size={32} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800">No match found</h3>
                 <p className="text-gray-500 max-w-sm mx-auto mt-2">Try searching for something else or explore the global feed!</p>
                 <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-6 px-6 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/20 transition"
                 >
                   Clear Search
                 </button>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default Discover;
