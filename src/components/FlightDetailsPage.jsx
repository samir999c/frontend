// src/components/FlightDetailsPage.jsx
// PASTE THIS ENTIRE FILE.

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlightDetailsPage.css'; // Make sure you have this CSS file

// --- Helper Functions ---
const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const formatDate = (dateTime) => new Date(dateTime).toDateString();
const formatDuration = (dur) => dur.replace('PT', '').replace('H', 'h ').replace('M', 'm');

export default function FlightDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- THIS IS THE CRITICAL PART ---
  // It correctly looks for 'offer' and 'dictionaries'
  const { offer, dictionaries } = location.state || {};

  // This is the check that shows your error.
  // If 'offer' is missing (because you refreshed or the key was wrong),
  // it will show the "No Flight Selected" message.
  if (!offer || !dictionaries) {
    return (
      <div className="details-container-error">
        <h2>No Flight Selected</h2>
        <p>No flight details were found. Please go back and select a flight.</p>
        <button onClick={() => navigate('/koalaroute')} className="back-button">
          Back to Search
        </button>
      </div>
    );
  }

  // --- Helper functions to get names ---
  const getAirportName = (code) => dictionaries.locations[code]?.city || code;
  const getAirlineName = (code) => dictionaries.carriers[code] || code;

  // --- Data Extraction ---
  const travelerPricing = offer.travelerPricings[0];
  const fareDetails = travelerPricing.fareDetailsBySegment[0];

  const baggageInfo = fareDetails.includedCheckedBags;
  const amenities = fareDetails.amenities || [];
  const seatsLeft = offer.numberOfBookableSeats;
  const isRefundable = offer.pricingOptions.refundableFare.toString(); // Use toString() just in case

  const handleContinue = () => {
    // Navigate to the next page
    navigate("/flights/passengers", { state: { pricedOffer: offer } });
  };

  return (
    <div className="details-page-container">
      
      {/* --- ITINERARY DETAILS (MAIN COLUMN) --- */}
      <div className="itinerary-details-container">
        <h2>Flight Details</h2>
        {offer.itineraries.map((itinerary, index) => (
          <ItineraryTimeline
            key={index}
            itinerary={itinerary}
            getAirportName={getAirportName}
            getAirlineName={getAirlineName}
          />
        ))}
      </div>

      {/* --- SUMMARY & DETAILS (SIDEBAR) --- */}
      <div className="details-sidebar">
        <div className="info-box price-box">
          <h2>Total Price</h2>
          <div className="price">{offer.price.total} <span>{offer.price.currency}</span></div>
          <button onClick={handleContinue} className="continue-button">
            Continue to Booking
          </button>
        </div>

        <div className="info-box">
          <h3>Fare Rules</h3>
          <ul className="details-list">
            <li>
              <span className="icon">💺</span>
              <strong>Seats Left:</strong> {seatsLeft}
            </li>
            <li>
              <span className="icon">{isRefundable === 'true' ? '✅' : '❌'}</span>
              <strong>Refundable:</strong> {isRefundable === 'true' ? 'Yes' : 'Non-Refundable'}
            </li>
          </ul>
        </div>

        <div className="info-box">
          <h3>Baggage</h3>
          <ul className="details-list">
            <li>
              <span className="icon">🧳</span>
              <strong>Checked Bag:</strong> 
              {baggageInfo ? ` ${baggageInfo.quantity || 1} included` : ' Info not available'}
            </li>
            <li>
              <span className="icon">👜</span>
              <strong>Cabin Bag:</strong> 1 Standard
            </li>
          </ul>
        </div>
        
        <div className="info-box">
          <h3>Amenities</h3>
          <ul className="details-list amenities">
            {amenities.length > 0 ? amenities.map((amenity) => (
              <li key={amenity.description}>
                <span className="icon">{amenity.isChargeable ? '💲' : '✔️'}</span>
                {amenity.description.replace(/_/g, ' ')}
                {amenity.isChargeable && <span> (Chargeable)</span>}
              </li>
            )) : <li>No amenity data available.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Itinerary Timeline Component ---
function ItineraryTimeline({ itinerary, getAirportName, getAirlineName }) {
  const segments = itinerary.segments;

  return (
    <div className="itinerary-card">
      <h3 className="itinerary-header">
        {itinerary.id === '1' ? 'Outbound' : 'Return'} Flight
        <span className="total-duration">Total Duration: {formatDuration(itinerary.duration)}</span>
      </h3>
      
      <div className="timeline">
        {segments.map((segment, index) => {
          // Calculate layover
          let layoverInfo = null;
          if (index > 0) {
            const prevSegment = segments[index - 1];
            const layoverMs = new Date(segment.departure.at) - new Date(prevSegment.arrival.at);
            const layoverH = Math.floor(layoverMs / 3600000);
            const layoverM = Math.floor((layoverMs % 3600000) / 60000);
            layoverInfo = {
              duration: `${layoverH}h ${layoverM}m`,
              airport: prevSegment.arrival.iataCode,
              airportName: getAirportName(prevSegment.arrival.iataCode)
            };
          }

          return (
            <React.Fragment key={segment.id}>
              {/* --- 1. Show Layover Info --- */}
              {layoverInfo && (
                <div className="timeline-item layover">
                  <div className="timeline-icon clock">🕒</div>
                  <div className="timeline-content">
                    <strong>Layover: {layoverInfo.duration}</strong>
                    <span>{layoverInfo.airport} ({layoverInfo.airportName})</span>
                  </div>
                </div>
              )}

              {/* --- 2. Show Flight Segment --- */}
              <div className="timeline-item segment">
                <div className="timeline-icon plane">✈️</div>
                <div className="timeline-content">
                  <div className="segment-header">
                    <strong>{formatTime(segment.departure.at)} - {formatTime(segment.arrival.at)}</strong>
                    <span className="segment-date">{formatDate(segment.departure.at)}</span>
                  </div>
                  <div className="segment-airports">
                    <p><strong>{segment.departure.iataCode}</strong> ({getAirportName(segment.departure.iataCode)})</p>
                    <p><strong>{segment.arrival.iataCode}</strong> ({getAirportName(segment.arrival.iataCode)})</p>
                  </div>
                  <div className="segment-airline">
                    {getAirlineName(segment.carrierCode)} ({segment.carrierCode} {segment.number})
                    <span>Aircraft: {segment.aircraft.code}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}