// src/components/Autocomplete.js
import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";

function Autocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (value) => {
    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Debounce la función de búsqueda para optimizar las solicitudes
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    if (onSelect) {
      onSelect({
        name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
      });
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Buscar dirección..."
        className="w-full border border-gray-300 p-2 rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full max-h-60 overflow-y-auto z-10">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
