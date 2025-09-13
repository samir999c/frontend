import React, { useState } from "react";
import { API_BASE_URL } from "../config";
import "./ManualFlightForm.css";

export default function ManualFlightForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [passengers, setPassengers] = useState(1);
  const [tripClass, setTripClass] = useState("Y");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setSearchStatus("");

    if (!origin || !destination || !departure) {
      setError("Origin, destination, and departure date are required.");
      return;
    }

    setLoading(true);
    setSearchStatus("Initializing flight search...");
    const token = localStorage.getItem("token");

    try {
      // **FIXED**: Using the correct /koalaroute/flights endpoint
      const res = await fetch(`${API_BASE_URL}/koalaroute/flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        // **FIXED**: Body now matches the backend's expected format
        body: JSON.stringify({
          origin,
          destination,
          departure_at: departure,
          return_at: returnDate,
          currency,
          passengers,
          trip_class: tripClass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start flight search");
      }

      // The backend immediately returns data and a search_id
      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        setSearchStatus("");
        setLoading(false); // Stop loading since we have results
      } else {
        // If no initial data, it might mean the search is just slow
        setSearchStatus("Search in progress... This may take up to a minute.");
        // We can optionally add polling here if the backend doesn't wait
        // but the current koalaroute.js backend *does* wait, so this is fine.
        // If results are still empty after the backend timeout, it means no flights were found.
        setTimeout(() => {
           setSearchStatus("No flights found for the selected criteria.");
           setLoading(false);
        }, 5000); // Give it a few extra seconds before showing "not found"
      }
    } catch (err) {
      console.error("Flight search error:", err);
      setError(err.message);
      setSearchStatus("");
    } finally {
        // In this simplified model, the backend handles the waiting.
        // We can just turn off loading after the attempt.
        // For a more advanced UX, you would implement polling as in your first example.
        if(!flights.length){ // Only set loading to false if we don't have flights yet
             setTimeout(() => setLoading(false), 2000); // Give a bit of buffer
        }
    }
  };

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="manual-flight-form">
      <h2>Search Flights</h2>
      <form onSubmit={handleSearch}>
        {/* IATA code inputs */}
        <div className="form-row">
          <div className="form-group">
            <label>Origin (IATA code)</label>
            <input
              type="text"
              placeholder="e.g., NYC"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
          <div className="form-group">
            <label>Destination (IATA code)</label>
            <input
              type="text"
              placeholder="e.g., LON"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
        </div>

        {/* Date inputs */}
        <div className="form-row">
          <div className="form-group">
            <label>Departure Date</label>
            <input
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="form-group">
            <label>Return Date (optional)</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departure || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Passenger, Class, and Currency inputs */}
        <div className="form-row">
          <div className="form-group">
            <label>Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Class</label>
            <select
              value={tripClass}
              onChange={(e) => setTripClass(e.target.value)}
            >
              <option value="Y">Economy</option>
              <option value="C">Business</option>
              <option value="F">First</option>
            </select>
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      {searchStatus && <div className="search-status">{searchStatus}</div>}
      {error && <p className="error-text">{error}</p>}

      {/* Results Display */}
      {flights.length > 0 && (
        <div className="results-container">
          <h3>Found {flights.length} Flights</h3>
          <div className="flights-list">
            {flights.map((flight, index) => (
              <div key={index} className="flight-card">
                <div className="flight-header">
                  <div className="airline">{flight.airline || "Multiple Airlines"}</div>
                  <div className="price">
                    {flight.price} {flight.currency}
                  </div>
                </div>
                <div className="flight-details">
                  <div className="route">
                    <div className="segment">
                      <div className="city">{flight.origin}</div>
                      <div className="time">{formatTime(flight.departure_at)}</div>
                      <div className="date">{formatDate(flight.departure_at)}</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="segment">
                      <div className="city">{flight.destination}</div>
                      <div className="time">{formatTime(flight.arrival_at)}</div>
                      <div className="date">{formatDate(flight.arrival_at)}</div>
                    </div>
                  </div>
                  {/* Additional flight info can be added here */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}