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
    return () => { if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current); };
  }, []);

  const pollForResults = (searchId, token) => {
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError("Flight search timed out. Please try again.");
        setSearchStatus("");
        setLoading(false);
        return;
      }
      attempts++;
      setSearchStatus(`Searching... (Attempt ${attempts}/${maxAttempts})`);

      try {
        const pollUrl = `${API_BASE_URL}/koalaroute/flights/${searchId}?currency=${currency}&passengers=${passengers}`;
        const res = await fetch(pollUrl, {
          headers: { 
            // **CRITICAL FIX**: Authorization header added here
            Authorization: `Bearer ${token}` 
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Polling failed");

        if (data.status === 'complete') {
          setFlights(data.data);
          setSearchStatus(data.data.length === 0 ? "No flights were found." : "");
          setLoading(false);
        } else {
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

    // **CRITICAL FIX**: Check for token *before* making the request
    if (!token) {
        setError("Authentication error. Please log in again.");
        setLoading(false);
        setSearchStatus("");
        // Optionally redirect to login page here
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/koalaroute/flights`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // **CRITICAL FIX**: Authorization header was already here, but now it's confirmed necessary
          Authorization: `Bearer ${token}` 
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
      if (!res.ok) throw new Error(data.error || "Failed to start search");
      pollForResults(data.search_id, token);
    } catch (err) {
      setError(err.message);
      setSearchStatus("");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // The JSX for your form and results display remains the same
  return (
    <div className="manual-flight-form">
      {/* ... your form and results display JSX ... */}
    </div>
  );
}