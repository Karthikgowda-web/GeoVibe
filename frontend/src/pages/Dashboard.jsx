import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Map, MapPin, Users, Clock, Search, Bell, Plus, ChevronRight, Hash, Code, Monitor, Zap, Globe, CheckCircle, Compass } from 'lucide-react';
import { useGeoLocation } from '../hooks/useGeoLocation';
import MapComponent from '../components/MapComponent';
import { io } from 'socket.io-client';
import { getDistance } from '../utils/distance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { getEventImageUrl } from '../utils/imageUrl';
import EventCard from '../components/EventCard';
import { Loader2, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { name: 'Hackathon', icon: <Code size={18} /> },
  { name: 'News & Alerts', icon: <Globe size={18} /> },
  { name: 'Cultural Events', icon: <Monitor size={18} /> },
  { name: 'Meetups', icon: <Users size={18} /> },
  { name: 'Workshops', icon: <Zap size={18} /> },
];

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
 * Main dashboard for the GeoVibe application.
 * Handles event discovery, filtering, real-time alerts via Socket.io,
 * and mapping using React-Leaflet.
 * 
 * @component Dashboard
 * @returns {JSX.Element} The rendered dashboard page.
 */
const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const { location: geoCoords, error: geoError, loading: geoLoading } = useGeoLocation();
  const [overrideLocation, setOverrideLocation] = useState(null);
  const location = overrideLocation || geoCoords;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    if (lat && lng) {
      setOverrideLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  }, []);

  const [userProfile, setUserProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchRadius, setSearchRadius] = useState(25);
  const [isGlobalFallback, setIsGlobalFallback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────────
  // PERFORMANCE: DEBOUNCING
  // ─────────────────────────────────────────────────────────────────────────
  // We debounce the search term and radius to avoid rapid-fire API calls.
  // This reduces server load and prevents UI flickering.
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedSearchRadius = useDebounce(searchRadius, 400);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUserProfile(res.data);
        if (res.data.defaultDiscoveryRadius) {
          setSearchRadius(res.data.defaultDiscoveryRadius);
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
    }
  }, [token, API_URL]);
  // ─────────────────────────────────────────────────────────────────────────
  // DATA INTEGRITY FILTER PIPELINE
  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Remove events with no title or category (malformed DB entries).
  // Step 2: Apply the user's active search term against title, category, venue.
  // Step 3: Sort by deadline ascending so the most urgent events appear first.
  // This pipeline guarantees that only quality, actionable events reach the UI.
  const filteredEvents = events
    .filter(event => event && event.title && event.category) // Step 1: Data integrity guard
    .filter(event => {                                       // Step 1.5: Filter expired
      if (!event.deadline) return true;
      const beginningOfToday = new Date();
      beginningOfToday.setHours(0, 0, 0, 0);
      return new Date(event.deadline) >= beginningOfToday;
    })
    .filter(event => {                                         // Step 2: Search filter
      const term = debouncedSearchTerm.toLowerCase();
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) || 
        event.category.toLowerCase().includes(term) ||
        (event.venueName && event.venueName.toLowerCase().includes(term))
      );
    });

  // Step 3: Sort by deadline so soonest-expiring events surface at the top.
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
    const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
    return dateA - dateB;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setSearchRadius(25);
    setIsGlobalFallback(false);
    
        setIsDiscoverLoading(true);
    setTimeout(() => {
      setIsDiscoverLoading(false);
    }, 800);
  };

    const handleRegisterClick = async (eventId, url) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // Silently track engagement metrics in the background
      axios.post(`${API_URL}/api/events/click/${eventId}`).catch(e => console.warn('Tracking failed:', e));
      
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Registration link failed:', err);
    }
  };

  useEffect(() => {
    if (!location) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);
    
    socket.on('newEvent', (newEvent) => {
      if (newEvent.location && newEvent.location.coordinates) {
         const distance = getDistance(
           location.lat, 
           location.lng, 
           newEvent.location.coordinates[1], 
           newEvent.location.coordinates[0]
         );
         if (distance <= searchRadius * 1000) {
           setEvents((prev) => [newEvent, ...prev]);
           alert(`New Local Alert: A new event "${newEvent.title}" was reported nearby!`);
         }
      }
    });

    return () => socket.disconnect();
  }, [location, debouncedSearchRadius]);

  useEffect(() => {
    if (location) {
      setEventsLoading(true);
      setIsGlobalFallback(false);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('[DASHBOARD] Fetching from:', API_URL);
      let url = `${API_URL}/api/events/nearby?lat=${location.lat}&lng=${location.lng}&radius=${searchRadius}`;
      if (activeCategory !== 'All') {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }

      fetch(url)
        .then(res => res.json())
        .then(data => {
          console.log('[DASHBOARD] Nearby response:', data);
          const events = data.data || data;
          if (Array.isArray(events) && events.length > 0) {
            console.log('[DASHBOARD] Events received from nearby:', events.length);
            setEvents(events);
            setEventsLoading(false);
          } else {
            console.log('[DASHBOARD] No local events found, fetching global opportunities...');
            fetch(`${API_URL}/api/events/all`)
              .then(res => res.json())
              .then(globalData => {
                console.log('[DASHBOARD] Global response:', globalData);
                const allEvents = globalData.data || globalData;
                console.log('[DASHBOARD] Events received globally:', Array.isArray(allEvents) ? allEvents.length : 0);
                setEvents(Array.isArray(allEvents) ? allEvents : []);
                setIsGlobalFallback(true);
                setEventsLoading(false);
              })
              .catch(err => {
                console.error('Error fetching global events:', err);
                setEvents([]);
                setEventsLoading(false);
              });
          }
        })
        .catch(err => {
          console.error('Error fetching nearby events:', err);
          console.log('[DASHBOARD] Falling back to global events...');
          const API_URL2 = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          fetch(`${API_URL2}/api/events/all`)
            .then(res => res.json())
            .then(globalData => {
              const allEvents = globalData.data || globalData;
              setEvents(Array.isArray(allEvents) ? allEvents : []);
              setIsGlobalFallback(true);
              setEventsLoading(false);
            })
            .catch(() => {
              setEvents([]);
              setEventsLoading(false);
            });
        });
    } else {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('[DASHBOARD] No location yet, fetching all events from:', API_URL);
      setEventsLoading(true);
      fetch(`${API_URL}/api/events/all`)
        .then(res => res.json())
        .then(globalData => {
          const allEvents = globalData.data || globalData;
          console.log('[DASHBOARD] Events received (no location):', Array.isArray(allEvents) ? allEvents.length : 0);
          setEvents(Array.isArray(allEvents) ? allEvents : []);
          setIsGlobalFallback(true);
          setEventsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching events:', err);
          setEventsLoading(false);
        });
    }
  }, [location, activeCategory, debouncedSearchRadius]);

  const featuredEvents = sortedEvents.slice(0, 3); 
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full relative">
        {}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 px-6 gap-4">
            <div className="relative w-full max-w-xl flex items-center space-x-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search vibes (or type 'discover', 'host', 'settings'...)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const term = searchTerm.toLowerCase().trim();
                      if (term === 'discover') navigate('/discover');
                      else if (term === 'host') navigate('/host');
                      else if (term === 'settings') navigate('/settings');
                      else if (term === 'dashboard') navigate('/dashboard');
                    }
                  }}
                  className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition shadow-inner"
                />
              </div>
              <div className="flex bg-gray-100 p-1 rounded-full items-center shrink-0 border border-gray-200 shadow-inner">
                {[15, 25, 50, 100].map(val => (
                  <button 
                    key={val}
                    onClick={() => { setSearchRadius(val); setIsGlobalFallback(false); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${searchRadius === val ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {val}km
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
              <button 
                onClick={() => navigate('/host')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Host Event</span>
              </button>
              
              <div className="flex items-center space-x-2 relative">
                <button className="p-2 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 transition relative">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-10 w-10 text-brand-primary rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold shadow-sm hover:ring-2 hover:ring-brand-primary/20 transition cursor-pointer overflow-hidden"
                  >
                    {userProfile && userProfile.profilePicture ? (
                      <img src={userProfile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile && userProfile.name ? userProfile.name.charAt(0) : 'U'
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.name || 'Guest User'}</p>
                      </div>
                      <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Account Settings</button>
                      <button onClick={() => navigate('/host')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Hosted Events</button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => { logout(); navigate('/auth'); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {}
          <div className="flex items-center space-x-3 overflow-x-auto px-6 pb-3 pt-1 hide-scrollbar">
             <button 
               onClick={resetFilters}
               className={`flex items-center space-x-2 whitespace-nowrap border px-4 py-2 rounded-full text-sm font-bold transition shadow-sm bg-white border-gray-200 text-brand-primary hover:bg-blue-50`}
             >
               <Compass size={18} />
               <span>Discover</span>
             </button>
             <div className="h-6 w-px bg-gray-200 mx-1 shrink-0"></div>
             {CATEGORIES.map((cat, idx) => {
               const isActive = activeCategory === cat.name;
               return (
                 <button 
                   key={idx} 
                   onClick={() => setActiveCategory(isActive ? 'All' : cat.name)}
                   className={`flex items-center space-x-2 whitespace-nowrap border px-4 py-2 rounded-full text-sm font-medium transition shadow-sm ${isActive ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-primary/50 hover:bg-blue-50'}`}
                 >
                   <div className={`p-1 rounded-full ${isActive ? 'bg-white/20 text-white' : 'text-brand-primary bg-brand-primary/10'}`}>{cat.icon}</div>
                   <span>{cat.name}</span>
                 </button>
               );
             })}
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          
          {}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {}
            {featuredEvents.length > 0 && (() => {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const fallbackGradients = [
                'from-blue-600 to-indigo-800',
                'from-emerald-500 to-teal-700',
                'from-purple-600 to-pink-700',
              ];
              return (
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">Featured Vibes</h2>
                    <button className="text-sm font-semibold text-brand-primary hover:text-blue-800 flex items-center">
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar snap-x">
                    {featuredEvents.map((evt, idx) => {
                      const featuredImage = getEventImageUrl(evt.imageName) || evt.imageUrl;

                      return (
                        <div key={evt._id || idx} className="shrink-0 w-80 h-48 rounded-2xl relative overflow-hidden snap-start shadow-md group cursor-pointer border border-gray-200 flex items-center justify-center bg-gray-50">
                          {featuredImage ? (
                            <img
                              src={featuredImage}
                              alt={evt.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              onError={(e) => {
                                // If image fails, fall back to icon
                                e.target.style.display = 'none';
                                e.target.nextSibling.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`${featuredImage ? 'hidden' : ''} flex flex-col items-center`}>
                             {getCategoryIcon(evt.category)}
                             <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{evt.category}</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="inline-block px-2 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase rounded mb-2">Editor's Pick</span>
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{evt.title}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Opportunities List */}
            <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Opportunities Near You</h2>
                  {isDiscoverLoading && (
                    <div className="flex items-center space-x-2 text-brand-primary animate-pulse">
                      <div className="h-2 w-2 bg-brand-primary rounded-full"></div>
                      <span className="text-xs font-bold uppercase tracking-wider">Scanning Area...</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Discover and participate in local engagements.</p>

              {geoLoading && <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">Acquiring live coordinates...</div>}
              {geoError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm mb-4">{geoError}</div>}
              {(eventsLoading || isDiscoverLoading) && (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4 animate-pulse">
                   <div className="h-12 w-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                   <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Recalibrating Vibes...</p>
                </div>
              )}
              
              {!eventsLoading && !isDiscoverLoading && isGlobalFallback && (
                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mb-6 flex items-center space-x-3">
                  <div className="bg-brand-primary p-2 rounded-lg text-white">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-primary">Global Opportunities Active</h4>
                    <p className="text-sm text-brand-primary/80">No events found in your area. Showing verified events from across the platform.</p>
                  </div>
                </div>
              )}
              
              {!eventsLoading && !isDiscoverLoading && filteredEvents.length === 0 && location && (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass size={32} className="text-gray-300 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Local Vibes are quiet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">No opportunities found within {searchRadius}km matching your filters.</p>
                  
                  <div className="mt-6 flex flex-col items-center gap-3">
                    {searchRadius < 100 ? (
                      <button 
                        onClick={() => setSearchRadius(searchRadius < 50 ? 50 : 100)}
                        className="px-6 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition flex items-center"
                      >
                        <RefreshCw size={16} className="mr-2" /> 
                        Expand Search to {searchRadius < 50 ? '50' : '100'}km
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setActiveCategory('All');
                        }}
                        className="text-brand-primary font-bold hover:underline"
                      >
                        Explore all categories instead?
                      </button>
                    )}
                  </div>
                </div>
              )}
 
              <div className={`space-y-8 transition-opacity duration-300 ${isDiscoverLoading ? 'opacity-0' : 'opacity-100'}`}>
                {}
                {sortedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {sortedEvents.map((event, index) => (
                      <EventCard key={event._id || index} event={event} index={index} location={location} handleRegisterClick={handleRegisterClick} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No events here yet</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Be the first to spark something in this category! Host an event and pin it on our map.</p>
                    <div className="mt-6 flex flex-col items-center gap-4">
                      <button 
                        onClick={() => navigate('/host')}
                        className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1"
                      >
                        Host Your Own Event
                      </button>
                      <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-brand-primary font-bold">
                        Or clear all filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {}
          <div className="w-full lg:w-1/3">
             <div className="sticky top-28 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white flex flex-col">
               <div className="p-3 border-b border-gray-100 bg-white flex items-center justify-between z-10 shadow-sm relative">
                 <div className="flex items-center font-bold text-gray-800">
                   <Map className="mr-2 text-brand-primary" size={18} /> Interactive Map
                 </div>
               </div>
               <div className="flex-1 w-full bg-gray-100 relative z-0">
                  <MapComponent 
                    userLocation={location} 
                    events={sortedEvents} 
                    isPosting={false} 
                    onMapClick={() => {}} 
                    searchRadius={searchRadius}
                  />
               </div>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
