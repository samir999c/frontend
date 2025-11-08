// src/components/FlightResultsPage.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FlightResultsPage.css"; // We will update this file

// --- HELPER FUNCTIONS ---
const formatTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric'
  });
};

const formatDuration = (duration) => {
  return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
};
// -------------------------

export default function FlightResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Renamed 'flights' to 'flightOffers' to match Amadeus data
  const { flightOffers, dictionaries } = location.state || { flightOffers: [], dictionaries: {} };

  if (!flightOffers || flightOffers.length === 0) {
    return (
      <div className="flight-results-container">
        <h2>No Flights Found</h2>
        <p>Your search returned no results. Please try again.</p>
        <button className="back-to-search" onClick={() => navigate("/koalaroute")}>Back to Search</button>
      </div>
    );
  }

  // --- NEW HELPER FUNCTIONS for names ---
  const getAirlineName = (carrierCode) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  // THIS IS THE KEY for airport names
  const getAirportName = (iataCode) => {
    return dictionaries?.locations?.[iataCode]?.city || iataCode;
  };
  // ------------------------------------

  // Get the date from the first flight to display in the header
  const departureDate = formatDate(flightOffers[0].itineraries[0].segments[0].departure.at);

  const handleSelectFlight = (offer) => {
    navigate("/flights/details", { 
      state: { offer, dictionaries } 
    });
  };

  return (
    <div className="flight-results-container">
      <div className="results-header">
        <h2>Flight Results</h2>
        <span>{departureDate}</span>
      </div>
      <div className="flights-list">
        {flightOffers.map((offer) => (
          <FlightCard
            key={offer.id}
            offer={offer}
            getAirlineName={getAirlineName}
            getAirportName={getAirportName}
            onSelect={() => handleSelectFlight(offer)}
          />
        ))}
      </div>
    </div>
  ); 
}

// --- NEW FlightCard Component ---
// This component contains the new design logic
function FlightCard({ offer, getAirlineName, getAirportName, onSelect }) {
  
  // We'll just show the first itinerary (outbound)
  const itinerary = offer.itineraries[0]; 
  const segments = itinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;

  // Get the main airline for the card
  const airlineName = getAirlineName(firstSegment.carrierCode);

  return (
    <div className="flight-card" onClick={onSelect}>
      <div className="flight-details">
        {/* Airline Info */}
        <div className="airline-info">
          {/* You can add an <img /> tag here if you have airline logos */}
          <span className="airline-name">{airlineName}</span>
        </div>

        {/* Journey Visualization */}
        <div className="journey-info">
          
          <div className="journey-point start">
            <strong>{formatTime(firstSegment.departure.at)}</strong>
            <span className="iata-code">{firstSegment.departure.iataCode}</span>
            <span className="airport-name">{getAirportName(firstSegment.departure.iataCode)}</span>
          </div>

          <div className="journey-line">
            <span className="duration">🕒 {formatDuration(itinerary.duration)}</span>
            <div className="line-graphic">
              <span className="dot"></span>
              <span className="line"></span>
              
              {/* --- THIS IS THE STOPOVER LOGIC --- */}
              {stops === 0 && (
                <span className="stop-text direct">Direct</span>
              )}
              {stops > 0 && (
                <div className="stop-text">
                  <span>{stops} {stops > 1 ? 'Stops' : 'Stop'}</span>
                  {/* Show IATA code for each stop */}
                  {segments.slice(0, -1).map(seg => (
                    <span key={seg.id} className="stop-iata">{seg.arrival.iataCode}</span>
                  ))}
                </div>
              )}
              {/* ------------------------------------- */}

              <span className="dot"></span>
            </div>
            <span className="airline-list">
              {/* List all airlines in the journey */}
              {[...new Set(segments.map(s => s.carrierCode))].join(', ')}
            </span>
          </div>

          <div className="journey-point end">
            <strong>{formatTime(lastSegment.arrival.at)}</strong>
            <span className="iata-code">{lastSegment.arrival.iataCode}</span>
            <span className="airport-name">{getAirportName(lastSegment.arrival.iataCode)}</span>
          </div>

        </div>
      </div>

      {/* Booking Section */}
      <div className="booking-section">
        <div className="price">{offer.price.total} <span>{offer.price.currency}</span></div>
        <button className="select-flight-button">
          Select Flight
        </button>
      </div>
    </div>
  );
}