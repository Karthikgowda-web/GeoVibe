import React, { createContext, useState, useContext } from 'react';

/**
 * @file SearchContext.jsx
 * @description Manages the global search state (radius, category, term, location)
 * to ensure synchronization between Map, List, and Navbar components.
 */

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);
  const [activeCategory, setActiveCategory] = useState('All');
  const [mapLocation, setMapLocation] = useState(null); // { lat, lng }

  const resetFilters = () => {
    setSearchTerm('');
    setSearchRadius(25);
    setActiveCategory('All');
  };

  return (
    <SearchContext.Provider value={{
      searchTerm, setSearchTerm,
      searchRadius, setSearchRadius,
      activeCategory, setActiveCategory,
      mapLocation, setMapLocation,
      resetFilters
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
