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
  
  // This is your working code. It's correct.
  const { flights, dictionaries } = location.state || { flights: [], dictionaries: {} };

  if (!flights || flights.length === 0) {
    return (
      <div className="flight-results-container">
        <h2>No Flights Found</h2>
        <p>Your search returned no results. Please try again.</p>
        <button className="back-to-search-btn" onClick={() => navigate("/koalaroute")}>Back to Search</button>
      </div>
    );
  }

  // --- HELPER FUNCTIONS for names ---
  const getAirlineName = (carrierCode) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  const getAirportName = (iataCode) => {
    // Dictionaries 'locations' holds airport info
    return dictionaries?.locations?.[iataCode]?.city || iataCode;
  };
  // ------------------------------------

  // --- THIS IS THE FIX ---
  // The key 'offer' has been changed to 'flight'
  // to match what FlightDetailsPage is expecting.
  const handleSelectFlight = (flightOffer) => {
    navigate("/flights/details", { 
      state: { 
        flight: flightOffer, // <-- This is the fix
        dictionaries: dictionaries 
      } 
    });
  };
  // -----------------------

  // Get the date from the first flight to display in the header
  const departureDate = formatDate(flights[0].itineraries[0].segments[0].departure.at);

  return (
    <div className="flight-results-container">
      <div className="results-header">
        <h2>Flight Results</h2>
        <span>{departureDate}</span>
      </div>

      <div className="flights-list">
        {flights.map((offer) => (
          // Render the new card, designed to match your image
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


// --- FlightCard Component (WITH THE BUG FIX) ---
function FlightCard({ offer, getAirlineName, getAirportName, onSelect }) {
  
  // --- THIS IS THE FIX ---
  // If an offer has no itinerary data, skip rendering this card.
  // This prevents the crash you were seeing.
  if (!offer.itineraries || offer.itineraries.length === 0) {
    return null; 
  }
  // ------------------------

  const itinerary = offer.itineraries[0]; 
  const segments = itinerary.segments;
  
  // Extra safety check for segments
  if (!segments || segments.length === 0) {
    return null;
  }
  
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;

  const airlineName = getAirlineName(firstSegment.carrierCode);
  const airlineCode = firstSegment.carrierCode;
  const flightNumber = firstSegment.carrierCode + " " + firstSegment.number;

  return (
    <div className="flight-card" onClick={onSelect}>
      
      <div className="card-airline-name">
        <img
          src={`https://content.r9cdn.net/rimg/provider-logos/airlines/v/${airlineCode}.png`}
          alt=""
          className="airline-logo"
          onError={(e) => { e.target.style.display = 'none'; }} // Hide if logo fails
        />
        <span>{airlineName}</span>
      </div>

      <div className="card-main-content">
        {/* Left Column: Origin */}
        <div className="journey-point start">
          <strong>{formatTime(firstSegment.departure.at)}</strong>
          <span className="iata-code">{firstSegment.departure.iataCode}</span>
          <span className="airport-name">{getAirportName(firstSegment.departure.iataCode)}</span>
        </div>

        {/* Middle Column: Timeline */}
        <div className="journey-middle-line">
          <div className="duration">🕒 {formatDuration(itinerary.duration)}</div>
          <div className="line-graphic">
            <span className="dot"></span>
            <span className="line"></span>
            {/* --- Stopover Pill (like BAH) --- */}
            {stops > 0 && (
              <>
                <div className="stopover-info">
                  <span className="stop-text">{stops} Stop</span>
                  <span className="stop-pill">{segments[0].arrival.iataCode}</span>
                </div>
                <span className="line"></span>
              </>
            )}
            <span className="dot"></span>
          </div>
          <div className="flight-number">{flightNumber}</div>
        </div>

        {/* Right Column: Destination */}
        <div className="journey-point end">
          <strong>{formatTime(lastSegment.arrival.at)}</strong>
          <span className="iata-code">{lastSegment.arrival.iataCode}</span>
          <span className="airport-name">{getAirportName(lastSegment.arrival.iataCode)}</span>
        </div>

        {/* Price & Button Column */}
        <div className="booking-section">
          <div className="price">{offer.price.total} <span>{offer.price.currency}</span></div>
          <button className="book-now-button">
            Select Flight
          </button>
        </div>
      </div>
    </div>
  );
}