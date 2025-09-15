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
    if (origin === destination) {
      setError("Origin and destination cannot be the same.");
      return;
    }

    setLoading(true);
    setSearchStatus("Searching for flights... This may take up to a minute.");
    const token = localStorage.getItem("token");

    try {
      // Frontend now makes a single request and waits for the final response
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
          return_at: returnDate || "",
          passengers,
          trip_class: tripClass,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        setSearchStatus("");
      } else {
        setSearchStatus("No flights were found for the selected criteria.");
      }
    } catch (err) {
      console.error("Flight search error:", err);
      setError(err.message);
      setSearchStatus("");
    } finally {
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
        {/* Your JSX remains the same */}
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <input type="text" placeholder="e.g., SYD" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} maxLength={3} required />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input type="text" placeholder="e.g., MEL" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} maxLength={3} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Departure</label>
            <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
          </div>
          <div className="form-group">
            <label>Return</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departure || new Date().toISOString().split("T")[0]} />
          </div>
        </div>
        <div className="form-row">
            <div className="form-group">
                <label>Passengers</label>
                <select value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Class</label>
                <select value={tripClass} onChange={(e) => setTripClass(e.target.value)}>
                    <option value="Y">Economy</option>
                    <option value="C">Business</option>
                </select>
            </div>
            <div className="form-group">
                <label>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                </select>
            </div>
        </div>
        <button type="submit" disabled={loading}>{loading ? "Searching..." : "Search Flights"}</button>
      </form>

      {searchStatus && <div className="search-status">{searchStatus}</div>}
      {error && <p className="error-text">{error}</p>}

      {flights.length > 0 && (
        <div className="results-container">
          <h3>Found {flights.length} Flights</h3>
          {/* Your results display JSX remains the same */}
        </div>
      )}
    </div>
  );
}