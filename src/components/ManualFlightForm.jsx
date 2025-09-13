import React, { useState, useRef, useEffect } from "react";
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
  
  // Use a ref to store the timeout ID to prevent memory leaks or duplicate polling
  const pollingTimeoutRef = useRef(null);

  // Cleanup effect to clear timeout if the component unmounts
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const pollForResults = (searchId, token) => {
    let attempts = 0;
    const maxAttempts = 12; // 12 attempts * 5 seconds = 60 seconds total

    const poll = async () => {
      // Stop polling if a new search has started or component unmounted
      if (!loading && !searchStatus) return; 

      if (attempts >= maxAttempts) {
        setError("Flight search timed out. Please try again.");
        setSearchStatus("");
        setLoading(false);
        return;
      }
      attempts++;
      setSearchStatus(`Searching... (Attempt ${attempts}/${maxAttempts})`);

      try {
        // Pass currency and passengers as query params for final price conversion
        const pollUrl = `${API_BASE_URL}/aviasales/flights/${searchId}?currency=${currency}&passengers=${passengers}`;
        const res = await fetch(pollUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Polling failed");

        if (data.status === 'complete') {
          setFlights(data.data);
          if (data.data.length === 0) {
            setSearchStatus("No flights were found for the selected criteria.");
          } else {
            setSearchStatus(""); // Clear status on success
          }
          setLoading(false);
        } else {
          // If still pending, poll again after 5 seconds
          pollingTimeoutRef.current = setTimeout(poll, 5000);
        }
      } catch (err) {
        setError(err.message);
        setSearchStatus("");
        setLoading(false);
      }
    };
    poll();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setSearchStatus("");
    if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
    }

    if (!origin || !destination || !departure) {
      setError("Origin, destination, and departure date are required.");
      return;
    }
    if (origin === destination) {
      setError("Origin and destination cannot be the same.");
      return;
    }

    setLoading(true);
    setSearchStatus("Initializing search...");
    const token = localStorage.getItem("token");

    try {
      // Step 1: Initialize the search and get a search_id
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Step 2: Start polling for results with the received search_id
      pollForResults(data.search_id, token);

    } catch (err) {
      setError(err.message);
      setSearchStatus("");
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
        {/* Your form inputs remain the same... */}
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
          <div className="flights-list">
            {flights.map((flight, index) => (
              <div key={index} className="flight-card">
                <div className="flight-header">
                  <div className="airline">{flight.airline || "Multiple Airlines"}</div>
                  <div className="price">{flight.price} {flight.currency}</div>
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