import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Bell, Shield, ChevronRight, Save, LogOut, Camera, MapPin, Globe } from 'lucide-react';

const Settings = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePicture: '',
    emailNotifications: true,
    defaultDiscoveryRadius: 25
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          profilePicture: res.data.profilePicture || '',
          emailNotifications: res.data.emailNotifications !== undefined ? res.data.emailNotifications : true,
          defaultDiscoveryRadius: res.data.defaultDiscoveryRadius || 25
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate, API_URL]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('profilePicture', file);

    setIsUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/upload`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, profilePicture: res.data.url }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Photo upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.patch(`${API_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

    const getAvatarUrl = () => {
    if (!formData.profilePicture) return null;
    if (formData.profilePicture.startsWith('http')) return formData.profilePicture;
    return `${API_URL}${formData.profilePicture}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full">
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="text-brand-primary mr-3" size={28} /> User Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your identity and discovery preferences</p>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} flex items-center shadow-sm animate-in fade-in slide-in-from-top-2`}>
              <div className={`h-2 w-2 rounded-full mr-3 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center"><User size={20} className="mr-2 text-brand-primary"/> Profile Details</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="relative group mx-auto md:mx-0">
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="h-32 w-32 rounded-3xl bg-blue-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-brand-primary/10 transition group"
                      >
                        {formData.profilePicture ? (
                          <img src={getAvatarUrl()} alt="Profile" className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : 'opacity-100'}`}/>
                        ) : (
                          <span className="text-3xl font-black text-brand-primary uppercase">{formData.name ? formData.name.charAt(0) : 'U'}</span>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Camera className="text-white" size={24}/>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                   </div>
                   <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" 
                            placeholder="Your public name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" 
                            placeholder="hello@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Short Bio</label>
                        <textarea 
                          rows="3"
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          className="w-full border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition" 
                          placeholder="Tell the community about your vibe..."
                        />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center"><Bell size={20} className="mr-2 text-brand-accent"/> Interaction Preferences</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between py-2">
                   <div>
                     <h3 className="font-bold text-gray-900">Email Notifications</h3>
                     <p className="text-sm text-gray-500">Get alerts about new hackathons in your radius</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, emailNotifications: !formData.emailNotifications})}
                     className={`w-12 h-6 rounded-full transition-colors relative ${formData.emailNotifications ? 'bg-brand-primary' : 'bg-gray-200'}`}
                   >
                     <div className={`absolute top-1 bg-white h-4 w-4 rounded-full transition-all ${formData.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">Default Discovery Radius</h3>
                      <p className="text-sm text-gray-500">Set your starting search zone for new alerts</p>
                    </div>
                    <select 
                      value={formData.defaultDiscoveryRadius}
                      onChange={(e) => setFormData({...formData, defaultDiscoveryRadius: parseInt(e.target.value)})}
                      className="border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition font-bold"
                    >
                      <option value="10">10 km (Local)</option>
                      <option value="25">25 km (Regional)</option>
                      <option value="50">50 km (Extended)</option>
                      <option value="100">100 km (Network wide)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 pb-12">
               <button 
                 type="button"
                 onClick={handleLogout}
                 className="w-full md:w-auto flex items-center justify-center px-6 py-3 border border-red-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition shadow-sm"
               >
                 <LogOut size={18} className="mr-2"/> Terminate Session
               </button>
               <button 
                 type="submit"
                 disabled={saving}
                 className="w-full md:w-auto flex items-center justify-center px-10 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
               >
                 {saving ? 'Syncing...' : (
                   <span className="flex items-center"><Save size={18} className="mr-2"/> Update All Settings</span>
                 )}
               </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Settings;
