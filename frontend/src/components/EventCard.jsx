import React, { useState } from 'react';
import { MapPin, Users, Clock, CheckCircle, Code, Globe, Monitor, Users as UsersIcon, Zap, Hash } from 'lucide-react';
import { getDistance } from '../utils/distance';
import { getEventImageUrl } from '../utils/imageUrl';

const getCategoryIcon = (cat) => {
  switch(cat) {
    case 'Hackathon': return <Code size={40} className="text-gray-300" />;
    case 'News & Alerts': return <Globe size={40} className="text-gray-300" />;
    case 'Cultural Events': return <Monitor size={40} className="text-gray-300" />;
    case 'Meetups': return <UsersIcon size={40} className="text-gray-300" />;
    case 'Workshops': return <Zap size={40} className="text-gray-300" />;
    default: return <Hash size={40} className="text-gray-300" />;
  }
};

const formatExternalUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://unstop.com${url.startsWith('/') ? '' : '/'}${url}`;
};

const getCleanSearchUrl = (title) => {
  if (!title) return '';
  let cleanTitle = title.replace(/Alerts|Civic/gi, '').trim();
  const words = cleanTitle.split(/\s+/);
  if (words.length > 3) {
    cleanTitle = words.slice(0, 3).join(' ');
  }
  return `https://unstop.com/search?q=${encodeURIComponent(cleanTitle)}`;
};

const getRegistrationUrl = (event) => {
  if (event.registrationUrl) {
    return formatExternalUrl(event.registrationUrl);
  }
  if (event.title) {
    return getCleanSearchUrl(event.title);
  }
  return null;
};

const EventCard = ({ event, index, location, handleRegisterClick }) => {
  if (!event || !event.title) return null;

  let distanceStr = 'Unknown';
  if (location && event.location?.coordinates && Array.isArray(event.location.coordinates)) {
    const lat = event.location.coordinates[1];
    const lng = event.location.coordinates[0];
    if (typeof lat === 'number' && typeof lng === 'number') {
      const distance = getDistance(location.lat, location.lng, lat, lng);
      distanceStr = distance >= 1000 ? (distance / 1000).toFixed(1) + ' km away' : Math.round(distance) + ' m away';
    }
  }

  const teamSizeMin = event.teamSizeMin || 1;
  const teamSizeMax = event.teamSizeMax || ((index % 4) + 2);
  const isUserUpload = event.source === 'User';
  const organizer = isUserUpload 
    ? (event.author?.username || event.organizerName || 'Verified User')
    : (event.organizerName || 'GeoVibe Verified Network');
  
  let daysLeft = (index % 10) + 1; 
  if (event.deadline) {
    const diff = new Date(event.deadline) - new Date();
    daysLeft = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  const [imgLoading, setImgLoading] = useState(true);
  const [imgErrorCount, setImgErrorCount] = useState(0); 
  
  const techBackup = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=60';
  const isNews = event.category === 'News' || event.category === 'Alert' || event.category === 'News & Alerts';
  
  const newsFallback = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=500&q=60';
  const workshopFallback = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=60';
  const meetupFallback = 'https://images.unsplash.com/photo-1528605248644-14dd04cb113d?auto=format&fit=crop&w=500&q=60';

  const getBackupImage = (cat) => {
    if (cat === 'News & Alerts') return newsFallback;
    if (cat === 'Workshop' || cat === 'Workshops') return workshopFallback;
    if (cat === 'Meetup' || cat === 'Meetups') return meetupFallback;
    return techBackup;
  };

  const mainImage = getEventImageUrl(event.imageName) || event.imageUrl;
  const backupImage = getBackupImage(event.category);

  const handleRedirect = (e) => {
    e.stopPropagation();
    const resolvedUrl = getRegistrationUrl(event);
    if (resolvedUrl) {
      window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
      if (handleRegisterClick) handleRegisterClick(event._id, null);
    }
  };

  const isToday = event.deadline && new Date(event.deadline).toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col sm:flex-row gap-5">
      <div className="h-40 w-full sm:w-48 shrink-0 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50 flex items-center justify-center">
        {imgLoading && mainImage && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {(mainImage || backupImage) && imgErrorCount < 2 ? (
          <img 
            src={imgErrorCount === 0 ? (mainImage || backupImage) : backupImage} 
            alt={event.title || 'Event Details'} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              if (imgErrorCount === 0 && mainImage) {
                setImgErrorCount(1); // Try backup next
              } else {
                setImgErrorCount(2); // Show icon
                setImgLoading(false);
              }
            }}
          />
        ) : null}

        <div className={`${(mainImage && imgErrorCount < 2) && !imgLoading ? 'hidden' : ''} flex flex-col items-center`}>
           {!imgLoading && (
             <>
               {getCategoryIcon(event.category)}
               <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">{event.category}</span>
             </>
           )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center">
            <h3 className="text-xl font-extrabold text-gray-900 pr-2 line-clamp-1">
              {event.title || 'Untitled Opportunity'}
            </h3>
            {event.isVerified && <CheckCircle size={18} className="text-blue-500 fill-blue-50" />}
          </div>
          <div className="flex items-center mt-1 space-x-2">
            {!isUserUpload && (
              <span className={`inline-flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                event.sourcePlatform === 'GeoVibe Official'
                  ? 'text-amber-700 bg-amber-100 border-amber-200'
                  : event.source === 'External' 
                    ? (event.sourcePlatform === 'PredictHQ' ? 'text-cyan-700 bg-cyan-100 border-cyan-200' : (event.sourcePlatform === 'Global News Feed' ? 'text-rose-700 bg-rose-100 border-rose-200' : 'text-indigo-700 bg-indigo-100 border-indigo-200'))
                    : 'text-gray-600 bg-gray-100 border-gray-200'
              }`}>
                {event.sourcePlatform === 'GeoVibe Official' 
                  ? '🌟 Official Vibe'
                  : (event.source === 'External' 
                    ? (event.sourcePlatform === 'PredictHQ' ? '📡 Public Data' : (event.sourcePlatform === 'Global News Feed' ? '🗞️ Live News' : `🌐 ${event.sourcePlatform || 'Public Source'}`))
                    : '🔹 System Managed')}
              </span>
            )}
            {isUserUpload && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center font-bold text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                  ✅ Verified Organizer
                </span>
                <p className="text-sm text-gray-600 font-bold">{organizer}</p>
              </div>
            )}
            {event.isOnline && (
              <span className="inline-flex items-center font-bold text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                ⚡ Remote
              </span>
            )}
          </div>
        </div>

        {isUserUpload && event.problemStatement && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Problem Statement</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-2">{event.problemStatement}</p>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold text-gray-500">
          {!isNews && (
            <>
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Users size={14} className="mr-1.5 text-brand-primary" />
                <span>Team: {teamSizeMin}-{teamSizeMax}</span>
              </div>
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Clock size={14} className="mr-1.5 text-orange-500" />
                <span>{isToday ? 'Ends Today' : (daysLeft === 0 ? 'Expired' : `${daysLeft} Days Left`)}</span>
              </div>
            </>
          )}
          <div className="flex items-center bg-blue-50 text-brand-primary px-2 py-1 rounded-md">
            <MapPin size={14} className="mr-1.5" />
            <span className="max-w-[150px] truncate">{event.venueName || distanceStr}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wide font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {event.category || 'Other'}
            </span>
          </div>
          <button 
            onClick={handleRedirect}
            className={`font-bold text-sm px-6 py-2 rounded shadow-sm transition active:scale-95 ${
              isNews 
                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                : (event.registrationUrl ? 'bg-brand-primary text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700')
            }`}
          >
            {isNews ? '🗞️ Read Full Story' : (event.registrationUrl ? 'Register Now' : '🔍 Find on Unstop')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
