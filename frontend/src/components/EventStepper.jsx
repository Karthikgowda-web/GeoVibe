import React, { useState } from 'react';
import MapComponent from './MapComponent';
import { MapPin, Image as ImageIcon, Users, Calendar, Link as LinkIcon, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';

const EventStepper = ({ initialData = null, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    title: '',
    category: 'Hackathon',
    organizerName: '',
    description: '',
    image: null,
    registerLink: '',
    teamSizeMin: 1,
    teamSizeMax: 4,
    deadline: '',
    lat: null,
    lng: null
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleMapClick = (coords) => {
    let wrapLng = coords.lng;
    while (wrapLng > 180) wrapLng -= 360;
    while (wrapLng < -180) wrapLng += 360;
    setFormData({ ...formData, lat: coords.lat, lng: wrapLng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      alert("Please select a location on the map in Step 4.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('geovibe_token') || ''; 
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('organizerName', formData.organizerName);
      data.append('description', formData.description);
      data.append('registerLink', formData.registerLink);
      data.append('teamSizeMin', formData.teamSizeMin);
      data.append('teamSizeMax', formData.teamSizeMax);
      if (formData.deadline) data.append('deadline', formData.deadline);
      data.append('longitude', formData.lng);
      data.append('latitude', formData.lat);
      
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }

      const headers = { 'Authorization': `Bearer ${token}` };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      let res;
      if (initialData && initialData._id) {
        res = await axios.put(`${API_URL}/api/events/manage/${initialData._id}`, data, { headers });
      } else {
        res = await axios.post(`${API_URL}/api/events/`, data, { headers });
      }
      
      if (res.status === 200) {
        onSuccess(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h2 className="text-xl font-bold text-gray-900">
             {initialData ? 'Edit Opportunity' : 'Host New Opportunity'}
           </h2>
           <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500">
             <span className={step >= 1 ? "text-brand-primary" : ""}>1. Basic</span>
             <ChevronRight size={14}/>
             <span className={step >= 2 ? "text-brand-primary" : ""}>2. Media</span>
             <ChevronRight size={14}/>
             <span className={step >= 3 ? "text-brand-primary" : ""}>3. Details</span>
             <ChevronRight size={14}/>
             <span className={step >= 4 ? "text-brand-primary" : ""}>4. Location</span>
           </div>
        </div>

        {}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Title</label>
                <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" placeholder="e.g. Global Tech Summit" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition">
                  <option>Hackathon</option>
                  <option>News & Alerts</option>
                  <option>Cultural Events</option>
                  <option>Meetup</option>
                  <option>Workshop</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Organizer Name</label>
                <input required type="text" value={formData.organizerName} onChange={e=>setFormData({...formData, organizerName: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" placeholder="Your Organization name" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center"><ImageIcon size={16} className="mr-2"/> Cover Image</label>
                <input type="file" accept="image/*" onChange={e=>setFormData({...formData, image: e.target.files[0]})} className="w-full border-gray-300 rounded-lg text-sm transition file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-primary hover:file:bg-blue-100 border cursor-pointer bg-gray-50" />
                {(formData.image || (initialData && initialData.imageUrl)) && <p className="text-xs text-green-600 mt-2 flex items-center"><CheckCircle2 size={14} className="mr-1"/> Image loaded securely</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center"><LinkIcon size={16} className="mr-2"/> Registration Link</label>
                <input type="url" value={formData.registerLink} onChange={e=>setFormData({...formData, registerLink: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition h-32 resize-none" placeholder="Provide full explicit details..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center"><Users size={16} className="mr-2"/> Min Team Size</label>
                   <input type="number" min="1" value={formData.teamSizeMin} onChange={e=>setFormData({...formData, teamSizeMin: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Team Size</label>
                   <input type="number" min="1" value={formData.teamSizeMax} onChange={e=>setFormData({...formData, teamSizeMax: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center"><Calendar size={16} className="mr-2"/> Registration Deadline</label>
                <input type="date" value={formData.deadline ? formData.deadline.substring(0,10) : ''} onChange={e=>setFormData({...formData, deadline: e.target.value})} className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 h-[400px] flex flex-col">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center"><MapPin size={16} className="mr-2"/> Pinpoint Exact Location</label>
              <div className="flex-1 border-2 border-gray-200 rounded-xl overflow-hidden shadow-inner">
                <MapComponent 
                  userLocation={formData.lat ? { lat: formData.lat, lng: formData.lng } : { lat: 40.7128, lng: -74.0060 }}
                  events={formData.lat ? [{ _id: 'temp', location: { coordinates: [formData.lng, formData.lat] } }] : []}
                  isPosting={true}
                  onMapClick={handleMapClick}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Click anywhere on the map to bind the coordinate.</p>
            </div>
          )}
        </div>

        {}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-200 transition">Cancel</button>
           <div className="flex space-x-3">
             {step > 1 && (
                <button type="button" onClick={handlePrev} className="px-5 py-2 rounded-lg text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center"><ChevronLeft size={16} className="mr-1"/> Back</button>
             )}
             {step < 4 ? (
                <button type="button" onClick={handleNext} className="px-6 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-blue-700 transition shadow-md flex items-center">Next <ChevronRight size={16} className="ml-1"/></button>
             ) : (
                <button type="button" onClick={handleSubmit} disabled={loading} className="px-6 py-2 rounded-lg text-sm font-bold bg-brand-accent text-white hover:bg-emerald-600 transition shadow-md flex items-center disabled:opacity-50">
                  {loading ? 'Processing...' : 'Publish Event'} <CheckCircle2 size={16} className="ml-2"/>
                </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default EventStepper;
