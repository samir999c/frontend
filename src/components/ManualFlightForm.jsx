import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./ManualFlightForm.css";

const AFFILIATE_MARKER = "662691"; 

export default function ManualFlightForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [passengers, setPassengers] = useState(1);
  const [tripClass, setTripClass] = useState("Y");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const pollingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  const pollForResults = (searchId, token) => {
    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      if (!loading) return;
      if (attempts >= maxAttempts) {
        setError("Flight search timed out. Please try again.");
        setSearchStatus("");
        setLoading(false);
        return;
      }

      attempts++;
      setSearchStatus(`Fetching flights... (Attempt ${attempts}/${maxAttempts})`);

      try {
        const res = await fetch(`${API_BASE_URL}/koalaroute/flights/${searchId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Polling failed");

        if (data.status === "complete" && Array.isArray(data.proposals) && data.proposals.length > 0) {
          setFlights(data.proposals);
          setSearchStatus("");
          setLoading(false);
          return;
        }

        if (data.status === "pending") {
          setSearchStatus("Still searching... please wait");
          pollingTimeoutRef.current = setTimeout(poll, 5000);
        } else {
          setSearchStatus("No flights found yet. Retrying...");
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

    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);

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
      if (!res.ok) throw new Error(data.error || "Flight search initiation failed");

      if (data.search_id) {
        pollForResults(data.search_id, token);
      } else {
        throw new Error("No search_id received from backend.");
      }
    } catch (err) {
      setError(err.message);
      setSearchStatus("");
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "-";
  const formatTime = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--:--";

  // ✅ Generate affiliate booking link
  const getBookingUrl = (flight) => {
    const baseUrl = "https://www.aviasales.com/search";
    const dep = flight.departure_at ? new Date(flight.departure_at) : null;
    const ret = flight.return_at ? new Date(flight.return_at) : null;

    const depDate = dep ? dep.toISOString().split("T")[0].replace(/-/g, "") : "";
    const retDate = ret ? ret.toISOString().split("T")[0].replace(/-/g, "") : "";

    return `${baseUrl}/${flight.origin}${depDate}${flight.destination}${retDate}?marker=${AFFILIATE_MARKER}&currency=${currency}`;
  };

  return (
    <div className="manual-flight-form">
      <h2>Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <input
              type="text"
              placeholder="e.g., SYD"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              required
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              placeholder="e.g., MEL"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Departure</label>
            <input
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
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
              {[...Array(8).keys()].map((n) => (
                <option key={n + 1} value={n + 1}>
                  {n + 1}
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
            </select>
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      {searchStatus && <div className="search-status">{searchStatus}</div>}
      {error && <p className="error-text">{error}</p>}

      {flights.length > 0 && (
        <div className="results-container">
          <h3>Found {flights.length} Flights</h3>
          <div className="flights-list">
            {flights.map((flight, idx) => (
              <div key={idx} className="flight-card">
                <div className="flight-header">
                  <div className="airline">{flight.airline}</div>
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
                      <div className="time">{formatTime(flight.return_at)}</div>
                      <div className="date">{formatDate(flight.return_at)}</div>
                    </div>
                  </div>
                </div>

                {/* ✅ Book Now Button */}
                <div className="book-now">
                  <a
                    href={getBookingUrl(flight)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="book-button"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
