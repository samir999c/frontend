import React, { useState } from "react";
import { API_BASE_URL } from "../config.js"; // Ensure this points to your backend URL
import "./ManualFlightForm.css";

export default function ManualFlightForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setLoading(true);

    if (!origin || !destination || !departureDate) {
      setError("Origin, destination, and departure date are required.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Search for flights (single request, no polling)
      const res = await fetch(`${API_BASE_URL}/duffel/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin,
          destination: destination,
          departure_date: departureDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to search for flights.");
      }
      
      setFlights(data.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (offerId, buttonElement) => {
    buttonElement.disabled = true;
    buttonElement.innerText = "Creating Link...";

    try {
      // Step 2: Create the Duffel Link
      const res = await fetch(`${API_BASE_URL}/duffel/create-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_id: offerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking link.");
      }

      // Step 3: Redirect user to the secure checkout page
      window.location.href = data.url;

    } catch (err) {
        alert(err.message); // Show error to the user
        buttonElement.disabled = false;
        buttonElement.innerText = "Book Now";
    }
  };

  return (
    <div className="manual-flight-form">
      <h2>Search Flights with Duffel</h2>
      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Origin (IATA)</label>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} placeholder="e.g., LHR" required />
          </div>
          <div className="form-group">
            <label>Destination (IATA)</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} placeholder="e.g., JFK" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Departure Date</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {flights.length > 0 && (
        <div className="results-container">
          <h3>Found {flights.length} Flights</h3>
          <div className="flights-list">
            {flights.map((offer) => (
              <div key={offer.id} className="flight-card">
                <div className="flight-details">
                  <div className="airline-logo">{offer.owner.name}</div>
                  <div className="route">
                    <div className="segment">
                      <div className="city">{offer.slices[0].origin.iata_code}</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="segment">
                      <div className="city">{offer.slices[0].destination.iata_code}</div>
                    </div>
                  </div>
                </div>
                <div className="booking-section">
                  <div className="price">{offer.total_amount} <span>{offer.total_currency}</span></div>
                  <button onClick={(e) => handleBooking(offer.id, e.target)} className="book-now-button">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}