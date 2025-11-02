import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import './FlightDetailsPage.css'; // We will create this file next

// --- HELPER FUNCTIONS ---
const formatTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatDate = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const formatDuration = (duration) => {
  return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
};

// --- MAIN COMPONENT ---
export default function FlightDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the offer and dictionaries from the results page
  const { offer, dictionaries } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!offer) {
    return (
      <div className="details-container">
        <h2>Error</h2>
        <p>No flight selected. Please go back to search.</p>
        <button onClick={() => navigate('/koalaroute')}>Back to Search</button>
      </div>
    );
  }

  const getAirlineName = (carrierCode) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  // --- This is the Price Check logic, moved from the results page ---
  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/flight-offers/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightOffers: [offer] }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.errors?.[0]?.detail || "Failed to re-price flight. Offer may have expired.");
      }

      // Success! Get the *new* priced offer
      const pricedOffer = data.data.flightOffers[0];
      
      // Navigate to the passenger form with the confirmed-price offer
      navigate("/flights/passengers", { state: { pricedOffer } });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Functions to render details ---

  const renderSegment = (segment) => (
    <div className="segment" key={segment.id}>
      <div className="segment-time-date">
        <strong>{formatTime(segment.departure.at)}</strong>
        <span>{formatDate(segment.departure.at)}</span>
      </div>
      <div className="segment-route-info">
        <span className="iata">{segment.departure.iataCode}</span>
        <div className="route-line-details">
          <span>{formatDuration(segment.duration)}</span>
        </div>
        <span className="iata">{segment.arrival.iataCode}</span>
      </div>
      <div className="segment-time-date">
        <strong>{formatTime(segment.arrival.at)}</strong>
        <span>{formatDate(segment.arrival.at)}</span>
      </div>
      <div className="segment-airline">
        {getAirlineName(segment.carrierCode)} ({segment.carrierCode} {segment.number})
        <span>{segment.aircraft.code.replace('_', ' ')}</span>
      </div>
    </div>
  );

  const renderLayover = (segments, index) => {
    const prevSegment = segments[index];
    const nextSegment = segments[index + 1];

    if (!nextSegment) return null;

    const layoverMs = new Date(nextSegment.departure.at) - new Date(prevSegment.arrival.at);
    const layoverDuration = formatDuration(`PT${Math.floor(layoverMs / 3600000)}H${Math.floor((layoverMs % 3600000) / 60000)}M`);

    return (
      <div className="layover">
        Layover: {layoverDuration} in {prevSegment.arrival.iataCode}
      </div>
    );
  };

  const renderBaggage = () => {
    try {
      // Amadeus baggage info is complex, this is a simple summary
      const travelerPricing = offer.travelerPricings[0];
      const fareDetails = travelerPricing.fareDetailsBySegment[0];
      
      return (
        <div className="info-box">
          <h3>Baggage Allowance</h3>
          <p>Cabin: {fareDetails.cabin}</p>
          <p>Included Checked Bags: {fareDetails.includedCheckedBags.quantity || 0}</p>
        </div>
      );
    } catch (e) {
      return <div className="info-box"><h3>Baggage</h3><p>Info not available.</p></div>;
    }
  };

  return (
    <div className="details-container">
      <div className="itinerary-details">
        {offer.itineraries.map((itinerary, index) => (
          <div className="itinerary-card" key={index}>
            <h2>{index === 0 ? "Outbound" : "Return"}</h2>
            <p className="total-duration">Total Duration: {formatDuration(itinerary.duration)}</p>
            {itinerary.segments.map((segment, segIndex) => (
              <React.Fragment key={segIndex}>
                {renderSegment(segment)}
                {renderLayover(itinerary.segments, segIndex)}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      <div className="summary-sidebar">
        <div className="price-box">
          <h2>Total Price</h2>
          <div className="price">{offer.price.total} <span>{offer.price.currency}</span></div>
        </div>
        {renderBaggage()}
        <div className="info-box">
          <h3>Fare Rules</h3>
          <p>{offer.numberOfBookableSeats} seats left</p>
          <p>{offer.pricingOptions.refundableFare ? "Refundable" : "Non-Refundable"}</p>
        </div>

        {error && <p className="error-text">{error}</p>}
        
        <button onClick={handleContinue} className="continue-button" disabled={loading}>
          {loading ? "Confirming Price..." : "Continue"}
        </button>
      </div>
    </div>
  );
}