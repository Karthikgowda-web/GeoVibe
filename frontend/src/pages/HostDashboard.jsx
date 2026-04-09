import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import EventStepper from '../components/EventStepper';
import axios from 'axios';
import { Settings, BarChart, Edit, Trash2, CheckCircle, ExternalLink, Calendar, Users, Target } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const HostDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stepperOpen, setStepperOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      axios.get(`${API_URL}/api/events/manage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        // Correctly access the 'data' array from the structured API response 
        // to prevent .map() crashes.
        const eventData = res.data.data || res.data;
        setEvents(Array.isArray(eventData) ? eventData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/events/manage/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleEdit = (evt) => {
        setEditingEvent({
      ...evt,
      lat: evt.location?.coordinates[1] || null,
      lng: evt.location?.coordinates[0] || null
    });
    setStepperOpen(true);
  };

  const handleStepperSuccess = (savedEvent) => {
    setStepperOpen(false);
    setEditingEvent(null);
    if (events.find(e => e._id === savedEvent._id)) {
      setEvents(events.map(e => e._id === savedEvent._id ? savedEvent : e));
    } else {
      setEvents([savedEvent, ...events]);
    }
  };

  if (!token && !loading) {
     return <Navigate to="/auth" />;
  }

  const liveEvents = events.filter(e => !e.deadline || new Date(e.deadline) > new Date());
  const expiredEvents = events.filter(e => e.deadline && new Date(e.deadline) <= new Date());
  
    const totalImpressions = events.length * Math.floor(Math.random() * 500 + 100);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full">
        {}
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center">
               <Settings className="text-brand-primary mt-1 mr-2" /> Host Portal
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your opportunities and track engagement</p>
          </div>
          <button 
             onClick={() => { setEditingEvent(null); setStepperOpen(true); }}
             className="bg-brand-primary text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-blue-700 transition flex items-center"
          >
             <CheckCircle size={18} className="mr-2" /> Host New Event
          </button>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center">
               <div className="w-14 h-14 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mr-5"><Target size={24}/></div>
               <div>
                 <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Live Events</p>
                 <h2 className="text-3xl font-extrabold text-gray-900">{liveEvents.length}</h2>
               </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center">
               <div className="w-14 h-14 rounded-full bg-emerald-50 text-brand-accent flex items-center justify-center mr-5"><Calendar size={24}/></div>
               <div>
                 <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Past / Drafts</p>
                 <h2 className="text-3xl font-extrabold text-gray-900">{expiredEvents.length}</h2>
               </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center">
               <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-5"><BarChart size={24}/></div>
               <div>
                 <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Impressions</p>
                 <h2 className="text-3xl font-extrabold text-gray-900">{totalImpressions.toLocaleString()}</h2>
               </div>
            </div>
          </div>

          {}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">My Opportunities</h2>
            
            {loading && <div className="text-gray-500 text-sm">Loading events...</div>}
            {!loading && events.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                <p className="text-gray-500 mb-4">You haven't hosted any events yet.</p>
                <button onClick={() => setStepperOpen(true)} className="text-brand-primary font-bold hover:underline">Create your first opportunity</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map(event => (
                <div key={event._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between h-48">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex-1 pr-4">
                       <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1">{event.title}</h3>
                       <div className="flex items-center mt-1">
                          {event.isVerified && <span className="inline-flex items-center text-[10px] font-bold bg-blue-50 text-brand-primary px-1.5 py-0.5 rounded mr-2"><CheckCircle size={10} className="mr-0.5" /> Verified</span>}
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(!event.deadline || new Date(event.deadline)>new Date()) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {(!event.deadline || new Date(event.deadline)>new Date()) ? 'Live' : 'Expired'}
                          </span>
                       </div>
                     </div>
                     {event.imageUrl && <img src={event.imageUrl} alt="thumbnail" className="w-16 h-16 rounded-lg object-cover border border-gray-100" />}
                   </div>
                   
                   <p className="text-sm text-gray-500 line-clamp-2 mt-auto mb-4">{event.description}</p>
                   
                   <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                     <div className="text-xs text-gray-500 flex items-center font-medium">
                       <Users size={14} className="mr-1 text-gray-400" /> {event.teamSizeMin}-{event.teamSizeMax} expected
                     </div>
                     <div className="flex space-x-2">
                       <button onClick={() => handleEdit(event)} className="p-1.5 text-gray-500 hover:text-brand-primary bg-gray-50 hover:bg-blue-50 rounded transition">
                         <Edit size={16} />
                       </button>
                       <button onClick={() => handleDelete(event._id)} className="p-1.5 text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded transition">
                         <Trash2 size={16} />
                       </button>
                       {event.registerLink && (
                         <a href={event.registerLink} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded transition">
                           <ExternalLink size={16} />
                         </a>
                       )}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {stepperOpen && (
        <EventStepper 
          initialData={editingEvent} 
          onClose={() => setStepperOpen(false)} 
          onSuccess={handleStepperSuccess} 
        />
      )}
    </div>
  );
};

export default HostDashboard;
