import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MapContainer from '../components/MapContainer';
import EventCard from '../components/EventCard';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useEvents } from '../hooks/useEvents';
import { useSearch } from '../context/SearchContext';
import { useDebounce } from '../hooks/useDebounce';
import { getEventImageUrl } from '../utils/imageUrl';
import { Loader2, RefreshCw, Compass, Globe, Plus, Code, Monitor, Users, Zap, Hash, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getCategoryIcon = (cat) => {
  switch(cat) {
    case 'Hackathon': return <Code size={40} className="text-gray-300" />;
    case 'News & Alerts': return <Globe size={40} className="text-gray-300" />;
    case 'Cultural Events': return <Monitor size={40} className="text-gray-300" />;
    case 'Meetups': return <Users size={40} className="text-gray-300" />;
    case 'Workshops': return <Zap size={40} className="text-gray-300" />;
    default: return <Hash size={40} className="text-gray-300" />;
  }
};

/**
 * @file Dashboard.jsx
 * @description Professional Production-Ready Dashboard.
 * Uses decoupled components, custom hooks, and global context for state.
 */
const Dashboard = () => {
  const { location: geoCoords, loading: geoLoading } = useGeoLocation();
  const { searchTerm, searchRadius, activeCategory, resetFilters } = useSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedRadius = useDebounce(searchRadius, 400);
  
  const { events, loading: eventsLoading, isGlobalFallback } = useEvents(geoCoords, debouncedRadius, activeCategory);
  const navigate = useNavigate();

  // Data Pipeline: Filtering & Sorting
  const filteredEvents = events
    .filter(event => event && event.title && event.category)
    .filter(event => {
      const term = debouncedSearchTerm.toLowerCase();
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) || 
        event.category.toLowerCase().includes(term) ||
        (event.venueName && event.venueName.toLowerCase().includes(term))
      );
    });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
    const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
    return dateA - dateB;
  });

  const featuredEvents = sortedEvents.slice(0, 3);

  const handleRegisterClick = async (eventId, url) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      axios.post(`${API_URL}/api/events/click/${eventId}`).catch(() => {});
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Registration link failed:', err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full relative">
        <Navbar />

        <main className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Featured Section */}
            {featuredEvents.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Featured Vibes</h2>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
                    View all <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar snap-x">
                  {featuredEvents.map((evt, idx) => {
                    const featuredImage = getEventImageUrl(evt.imageName) || evt.imageUrl;
                    return (
                      <div key={evt._id || idx} className="shrink-0 w-80 h-48 rounded-2xl relative overflow-hidden snap-start shadow-md group cursor-pointer border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {featuredImage ? (
                          <img src={featuredImage} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : getCategoryIcon(evt.category)}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase rounded mb-2">Featured</span>
                          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{evt.title}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Event List Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Opportunities Near You</h2>
                {(eventsLoading || geoLoading) && <Loader2 className="animate-spin text-blue-600" size={20} />}
              </div>

              {isGlobalFallback && !eventsLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                  <Globe className="text-blue-600" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-700">Global Opportunities</h4>
                    <p className="text-sm text-blue-600">Showing events from all locations.</p>
                  </div>
                </div>
              )}

              {sortedEvents.length > 0 ? (
                <div className="space-y-4">
                  {sortedEvents.map((event, index) => (
                    <EventCard 
                      key={event._id || index} 
                      event={event} 
                      index={index} 
                      location={geoCoords} 
                      handleRegisterClick={handleRegisterClick} 
                    />
                  ))}
                </div>
              ) : !eventsLoading && (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                  <Compass size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">No vibes found</h3>
                  <p className="text-gray-500 mt-2">Try expanding your search radius or changing category.</p>
                  <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md">
                    Reset Filters
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Map Section */}
          <div className="w-full lg:w-1/3">
            <MapContainer events={sortedEvents} location={geoCoords} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
