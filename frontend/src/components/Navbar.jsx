import React, { useState, useContext } from 'react';
import { Search, Bell, Plus, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const CATEGORIES = [
  { name: 'Hackathon' },
  { name: 'News & Alerts' },
  { name: 'Cultural Events' },
  { name: 'Meetups' },
  { name: 'Workshops' },
];

const Navbar = () => {
  const { userProfile, token, logout } = useContext(AuthContext);
  const { searchTerm, setSearchTerm, searchRadius, setSearchRadius, activeCategory, setActiveCategory, resetFilters } = useSearch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 px-6 gap-4">
        <div className="relative w-full max-w-xl flex items-center space-x-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search vibes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition shadow-inner"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-full items-center shrink-0 border border-gray-200">
            {[15, 25, 50, 100].map(val => (
              <button 
                key={val}
                onClick={() => setSearchRadius(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${searchRadius === val ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {val}km
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/host')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Host Event</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 overflow-hidden shadow-sm"
            >
              {userProfile?.profilePicture ? (
                <img src={userProfile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userProfile?.name?.charAt(0) || 'U'
              )}
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{userProfile?.name || 'User'}</p>
                </div>
                <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</button>
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
      
      <div className="flex items-center space-x-3 overflow-x-auto px-6 pb-3 pt-1 hide-scrollbar">
        <button 
          onClick={resetFilters}
          className="flex items-center space-x-2 whitespace-nowrap border px-4 py-2 rounded-full text-sm font-bold transition shadow-sm bg-white border-gray-200 text-blue-600 hover:bg-blue-50"
        >
          <Compass size={18} />
          <span>Discover</span>
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1 shrink-0"></div>
        {CATEGORIES.map((cat, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveCategory(activeCategory === cat.name ? 'All' : cat.name)}
            className={`flex items-center space-x-2 whitespace-nowrap border px-4 py-2 rounded-full text-sm font-medium transition shadow-sm ${activeCategory === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50'}`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
