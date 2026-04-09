import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Globe, MapPin } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      if (res.data.token) {
        login(res.data.token);
        navigate('/host');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="h-12 w-12 rounded-xl bg-blue-100 text-[#0056D2] flex items-center justify-center">
               <Globe size={28} />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">GeoVibe Portal</h2>
          <p className="text-gray-500 text-sm mt-2">{isLogin ? 'Sign in to manage your events' : 'Register to host opportunities'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input 
               type="text" required 
               value={formData.username} 
               onChange={e => setFormData({ ...formData, username: e.target.value })}
               className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition" 
               placeholder="Organizer username" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
               type="password" required 
               value={formData.password} 
               onChange={e => setFormData({ ...formData, password: e.target.value })}
               className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition" 
               placeholder="Your secure password" 
            />
          </div>
          
          <button type="submit" className="w-full flex justify-center py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0056D2] hover:bg-blue-700 transition">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#0056D2] text-sm font-medium hover:underline">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
