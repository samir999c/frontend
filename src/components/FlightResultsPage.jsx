// src/components/FlightResultsPage.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import "./FlightResultsPage.css";

export default function FlightResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flights, dictionaries } = location.state || { flights: [], dictionaries: {} };

  const [pricingError, setPricingError] = useState("");
  const [selectedFlightId, setSelectedFlightId] = useState(null); // To show loading on the correct button

  if (!flights || flights.length === 0) {
    return (
      <div className="flight-results-container">
        <h2>No Flights Found</h2>
        <p>Your search returned no results. Please try again.</p>
        <button onClick={() => navigate("/koalaroute")}>Back to Search</button>
      </div>
    );
  }

  // Helper to get Airline Name
  const getAirlineName = (carrierCode) => {
    return dictionaries.carriers?.[carrierCode] || carrierCode;
  };

  // Helper to format segments
  const renderItinerary = (itinerary) => {
    return itinerary.segments.map((segment, index) => (
      <div key={index} className="segment">
        <span className="iata">{segment.departure.iataCode}</span>
        <span> → </span>
        <span className="iata">{segment.arrival.iataCode}</span>
        <span className="airline">({getAirlineName(segment.carrierCode)})</span>
      </div>
    ));
  };

  // This is STEP 2: Price Confirmation
  const handleSelectFlight = async (flightOffer) => {
    setSelectedFlightId(flightOffer.id);
    setPricingError("");

    try {
      const res = await fetch(`${API_BASE_URL}/amadeus/flight-offers/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightOffers: [flightOffer] }), // Send the selected offer
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.errors[0]?.detail || "Failed to price flight.");
      }

      // IMPORTANT: We use the NEW priced offer from the response
      const pricedOffer = data.data.flightOffers[0];

      // Now, navigate to the passenger form, passing the *priced* offer
      navigate("/flights/passengers", { state: { pricedOffer } });

    } catch (err) {
      setPricingError(err.message);
    } finally {
      setSelectedFlightId(null); // Stop loading
    }
  };

  return (
    <div className="flight-results-container">
      <h2>Flight Results</h2>
      {pricingError && <p className="error-text">{pricingError}</p>}
      <div className="flights-list">
        {flights.map((offer) => (
          <div key={offer.id} className="flight-card">
            <div className="flight-details">
              {offer.itineraries.map((itinerary, index) => (
                <div key={index} className="itinerary">
                  <strong>{index === 0 ? "Outbound" : "Return"}</strong>
                  {renderItinerary(itinerary)}
                  <p>Duration: {itinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</p>
                </div>
              ))}
            </div>
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