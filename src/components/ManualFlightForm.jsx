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

  const pollingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  const pollForResults = (searchId, token) => {
    let attempts = 0;
    const maxAttempts = 24; // Up to 2 minutes with 5s interval

    const poll = async () => {
      if (!loading) return;

      if (attempts >= maxAttempts) {
        setError("Flight search timed out. Please try again.");
        setSearchStatus("");
        setLoading(false);
        return;
      }

      attempts++;
      setSearchStatus(`Searching flights... (Attempt ${attempts}/${maxAttempts})`);

      try {
        const pollUrl = `${API_BASE_URL}/koalaroute/flights/${searchId}`;
        const res = await fetch(pollUrl, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Polling failed");

        if (data.status === "complete" && data.data?.length > 0) {
          setFlights(data.data); // backend already formats results
          setSearchStatus("");
          setLoading(false);
          return;
        } else if (data.status === "pending") {
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

      pollForResults(data.search_id, token);
    } catch (err) {
      setError(err.message);
      setSearchStatus("");
      setLoading(false);
    }
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
            <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Return</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Passengers</label>
            <select value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))}>
              {[...Array(8).keys()].map((n) => (
                <option key={n + 1} value={n + 1}>
                  {n + 1}
                </option>
              ))}
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
                  <p>
                    {flight.origin} → {flight.destination}
                  </p>
                  <p>Depart: {flight.departure_at}</p>
                  {flight.return_at && <p>Return: {flight.return_at}</p>}
                </div>
                {/* ✅ Affiliate Book Now button */}
                <a
                  href={`https://www.aviasales.com/search/${flight.origin}${flight.departure_at.replaceAll(
                    "-",
                    ""
                  )}${flight.destination}${flight.return_at ? flight.return_at.replaceAll("-", "") : ""}1?marker=662691`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-now-btn"
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
