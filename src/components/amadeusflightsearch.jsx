// src/components/AmadeusFlightSearch.jsx
import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js"; 
import "./AmadeusFlightSearch.css"; 

export default function AmadeusFlightSearch() { 
  const [origin, setOrigin] = useState(null); 
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadAirportOptions = async (inputValue) => {
    if (inputValue.length < 2) return [];
    
    try {
      // THIS IS THE CORRECT URL
      const res = await fetch(
        `${API_BASE_URL}/airport-search?keyword=${inputValue}`
      );

      if (!res.ok) {
        console.error(`Server error: ${res.status}`);
        return []; 
      }
      
      const data = await res.json();

      if (!data.data || !Array.isArray(data.data)) {
        console.error("Amadeus API did not return valid airport data:", data);
        return []; 
      }

      return data.data.map((airport) => ({
        value: airport.iataCode,
        label: `${airport.address.cityName} - ${airport.name} (${airport.iataCode})`,
      }));

    } catch (err) {
      console.error("Airport search fetch failed:", err);
      return []; 
    }
  };
  
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

      // THIS IS THE CORRECT URL
      const res = await fetch(`${API_BASE_URL}/flight-offers`, {
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
              noOptionsMessage={() => null} // Hides "No options"
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
              noOptionsMessage={() => null} // Hides "No options"
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