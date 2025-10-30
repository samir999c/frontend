import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import "./FlightResultsPage.css";

export default function FlightResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // ... (rest of the component)

  const handleSelectFlight = async (flightOffer) => {
    setSelectedFlightId(flightOffer.id);
    setPricingError("");

    try {
      // *** URL FIXED: Removed /amadeus prefix ***
      const res = await fetch(`${API_BASE_URL}/flight-offers/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightOffers: [flightOffer] }), 
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.errors[0]?.detail || "Failed to price flight.");
      }

      const pricedOffer = data.data.flightOffers[0];
      navigate("/flights/passengers", { state: { pricedOffer } });

    } catch (err) {
      setPricingError(err.message);
    } finally {
      setSelectedFlightId(null); 
    }
  };

  // ... (rest of your component's JSX)
  // ... (no changes needed in the return statement)
  return (
    <div className="flight-results-container">
      <h2>Flight Results</h2>
      {pricingError && <p className="error-text">{pricingError}</p>}
      <div className="flights-list">
        {flights.map((offer) => (
          <div key={offer.id} className="flight-card">
            {/* ... flight card details ... */}
             <div className="booking-section">
              <div className="price">{offer.price.total} <span>{offer.price.currency}</span></div>
              <button 
                onClick={() => handleSelectFlight(offer)} 
                disabled={selectedFlightId === offer.id}
                className="book-now-button"
              >
                {selectedFlightId === offer.id ? "Pricing..." : "Select Flight"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}