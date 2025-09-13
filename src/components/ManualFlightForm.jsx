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
    setSearchStatus("Searching for flights... This may take a minute.");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/koalaroute/flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          origin,
          destination,
          departure_at: departure,
          return_at: returnDate || "", // Send empty string if not provided
          passengers,
          trip_class: tripClass,
          // **CRITICAL FIX**: 'currency' is passed to our backend,
          // which will use it for processing but NOT for the signature.
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // This will now catch the clear error from our backend
        throw new Error(data.error || "An unknown error occurred during search.");
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        setSearchStatus(""); // Clear status on success
      } else {
        // This case is hit if the backend search times out and returns no flights
        setSearchStatus("No flights were found for the selected criteria.");
      }

    } catch (err) {
      console.error("Flight search error:", err);
      setError(err.message); // Display the error message from the backend
      setSearchStatus("");
    } finally {
      // This will always run after the try/catch block
      setLoading(false);
    }
  };

  // Helper functions for formatting dates and times
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="manual-flight-form">
      <h2>Search Flights</h2>
      <form onSubmit={handleSearch}>
        {/* Form inputs... */}
        <div className="form-row">
          <div className="form-group">
            <label>Origin (IATA code)</label>
            <input
              type="text"
              placeholder="e.g., NYC"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              required
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
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Departure Date</label>
            <input
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
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

      {/* Status and Error Display */}
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
                      {/* Arrival time might not always be present in the API response */}
                      <div className="time">{flight.arrival_at ? formatTime(flight.arrival_at) : "--:--"}</div>
                      <div className="date">{flight.arrival_at ? formatDate(flight.arrival_at) : "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}