// src/components/AmadeusFlightSearch.jsx
// This file is now correctly imported by KoalaRoute.jsx

import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js"; 
import "./AmadeusFlightSearch.css"; // This import is correct (capitalized)

// Your KoalaRoute imports this file as "ManualFlightForm", 
// so the export name doesn't matter, but the file name does.
export default function AmadeusFlightSearch() { 
  const [origin, setOrigin] = useState(null); 
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ===================================================================
  //  THIS IS THE CRITICALLY FIXED FUNCTION
  //  It now properly handles all backend/API errors
  // ===================================================================
  const loadAirportOptions = async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/amadeus/airport-search?keyword=${inputValue}`
      );

      // 1. Check for server errors (e.g., 500, 404, 401 from your backend)
      if (!res.ok) {
        console.error(`Server error: ${res.status}`);
        return []; // Return empty on server error
      }
      
      const data = await res.json();

      // 2. Check for Amadeus errors (e.g., bad token, Amadeus API down)
      // If 'data.data' doesn't exist, it's an error structure.
      if (!data.data || !Array.isArray(data.data)) {
        console.error("Amadeus API did not return valid airport data:", data);
        return []; // Return empty on bad data structure
      }

      // 3. This is the only successful path
      return data.data.map((airport) => ({
        value: airport.iataCode,
        label: `${airport.address.cityName} - ${airport.name} (${airport.iataCode})`,
      }));

    } catch (err) {
      // 4. This catches network failures or CORS errors (check console!)
      console.error("Airport search fetch failed:", err);
      return []; // Always return an empty array on any failure
    }
  };

  // ===================================================================
  //  (This function below is fine)
  // ===================================================================
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");

    if (!origin || !destination || !departureDate || !adults) {
      setError("Please fill in Origin, Destination, Departure Date, and Adults.");
      return;
    }

    setLoading(true);

    try {
      const searchParams = {
        origin: origin.value,
        destination: destination.value,
        departureDate: departureDate,
        returnDate: returnDate || null,
        adults: adults,
      };

      const res = await fetch(`${API_BASE_URL}/amadeus/flight-offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors?.[0]?.detail || "No flights found.");
      }

      navigate("/flights/results", { 
        state: { 
          flights: data.data, 
          dictionaries: data.dictionaries 
        } 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search-form">
      <h2>Search Flights with Amadeus</h2>
      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadAirportOptions}
              onChange={setOrigin}
              placeholder="City or Airport (e.g., SYD)"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadAirportOptions}
              onChange={setDestination}
              placeholder="City or Airport (e.g., LHR)"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Return Date (Optional)</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Adults</label>
            <input
              type="number"
              min="1"
              max="9"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}