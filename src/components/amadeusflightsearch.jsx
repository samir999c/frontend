import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js"; 
import "./AmadeusFlightSearch.css";

export default function AmadeusFlightSearch() { 
  const [origin, setOrigin] = useState(null); 
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  
  // --- NEW STATE VARIABLES ---
  const [tripType, setTripType] = useState("ROUND_TRIP"); // ROUND_TRIP or ONE_WAY
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [travelClass, setTravelClass] = useState("ECONOMY"); // ECONOMY, BUSINESS, FIRST
  // ---------------------------

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadAirportOptions = async (inputValue) => {
    if (inputValue.length < 2) return [];
    try {
      const cacheBust = new Date().getTime();
      // --- URL FIX: Added /api prefix ---
      const res = await fetch(
        `${API_BASE_URL}/api/airport-search?keyword=${inputValue}&_cacheBust=${cacheBust}`
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

    // Updated validation check
    if (!origin || !destination || !departureDate || (tripType === "ROUND_TRIP" && !returnDate)) {
      setError("Please fill in all required flight details.");
      return;
    }

    setLoading(true);

    try {
      // --- UPDATED SEARCH PARAMETERS ---
      const searchParams = {
        origin: origin.value,
        destination: destination.value,
        departureDate: departureDate,
        returnDate: tripType === "ROUND_TRIP" ? returnDate : null,
        adults: adults,
        children: children,
        travelClass: travelClass,
      };
      // ---------------------------------

      // --- URL FIX: Added /api prefix ---
      const res = await fetch(`${API_BASE_URL}/api/flight-offers`, {
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

        {/* --- NEW: Trip Type Radio Buttons --- */}
        <div className="form-row trip-type">
          <div className="form-group-radio">
            <input 
              type="radio" 
              id="roundtrip" 
              name="tripType" 
              value="ROUND_TRIP"
              checked={tripType === "ROUND_TRIP"}
              onChange={(e) => setTripType(e.target.value)}
            />
            <label htmlFor="roundtrip">Round-trip</label>
          </div>
          <div className="form-group-radio">
            <input 
              type="radio" 
              id="one-way" 
              name="tripType" 
              value="ONE_WAY"
              checked={tripType === "ONE_WAY"}
              onChange={(e) => setTripType(e.target.value)}
            />
            <label htmlFor="one-way">One-way</label>
          </div>
        </div>

        {/* --- Origin/Destination --- */}
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadAirportOptions}
              onChange={setOrigin}
              placeholder="City or Airport (e.g., NYC)"
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => null} 
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadAirportOptions}
              onChange={setDestination}
              placeholder="City or Airport (e.g., PAR)"
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => null} 
            />
          </div>
        </div>

        {/* --- Dates (Return date is now conditional) --- */}
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
            <label>Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === "ONE_WAY"} // <-- DISBALED LOGIC
              required={tripType === "ROUND_TRIP"}
              style={{
                backgroundColor: tripType === "ONE_WAY" ? "#f4f4f4" : "#fff"
              }}
            />
          </div>
        </div>

        {/* --- NEW: Passenger/Class Selection --- */}
        <div className="form-row">
          <div className="form-group">
            <label>Adults (12+)</label>
            <input
              type="number"
              min="1"
              max="9"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div className="form-group">
            <label>Children (2-11)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div className="form-group">
            <label>Cabin Class</label>
            <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
              <option value="ECONOMY">Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First Class</option>
            </select>
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