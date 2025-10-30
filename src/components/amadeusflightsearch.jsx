// src/components/AmadeusFlightSearch.jsx

import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js"; // Make sure this is your backend URL
import "./AmadeusFlightSearch.css";

export default function AmadeusFlightSearch() {
  const [origin, setOrigin] = useState(null); // Will be { value: 'LHR', label: 'London (LHR)' }
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. Function to call your /airport-search backend
  const loadAirportOptions = async (inputValue) => {
    if (inputValue.length < 2) return [];

    try {
      const res = await fetch(
        `${API_BASE_URL}/amadeus/airport-search?keyword=${inputValue}`
      );
      if (!res.ok) throw new Error("Failed to fetch airports");

      const data = await res.json();
      
      // Format the data for react-select
      return data.data.map((airport) => ({
        value: airport.iataCode,
        label: `${airport.address.cityName} - ${airport.name} (${airport.iataCode})`,
      }));
    } catch (err) {
      console.error(err);
      return []; // Return empty on error
    }
  };

  // 2. Function to call your /flight-offers backend
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
        throw new Error(data.error?.errors[0]?.detail || "No flights found.");
      }

      // 3. Navigate to the results page with the flight data
      // We pass both the list of flights (data) and the airline names (dictionaries)
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
      <h2>Search Amadeus Flights</h2>
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