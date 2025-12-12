// src/components/SeatMapPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import './SeatMap.css'; 

export default function SeatMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { pricedOffer, travelerInfo } = location.state || {};

  const [seatMapData, setSeatMapData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // --- 1. SMART URL FIX ---
  // This line ensures the URL is correct no matter what your config.js says.
  // It removes any trailing "/api" or "/" so we can append it cleanly ourselves.
  const cleanBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  // ------------------------

  // 1. Fetch Seat Map
  useEffect(() => {
    if (!pricedOffer) return;

    const fetchSeatMap = async () => {
      try {
        // Use the clean URL + /api/seatmaps
        const res = await fetch(`${cleanBaseUrl}/api/seatmaps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pricedOffer: pricedOffer }),
        });
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           // If we get HTML, the backend is 404ing or crashing
           throw new Error("Seat map service unavailable.");
        }

        const data = await res.json();
        
        if (!res.ok) {
           // If Amadeus Test API says "no map", we handle it here.
           // We do NOT use fake data as you requested.
           setError("Seat selection is not available for this specific flight.");
           setSeatMapData(null); 
        } else {
           setSeatMapData(data.data);
        }

      } catch (err) {
        console.warn("Seat Map Error:", err.message);
        setError("Seat selection is not available for this flight.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [pricedOffer, cleanBaseUrl]);

  // 2. Final Booking Function
  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setError('');

    try {
      // Use the clean URL + /api/book
      // This is the specific line that was giving you the 404 before.
      const res = await fetch(`${cleanBaseUrl}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightOffer: pricedOffer,
          travelerInfo: travelerInfo,
          selectedSeat: selectedSeat 
        }),
      });

      const data = await res.json();
      
      // Check for 404 specifically on booking
      if (res.status === 404) {
          throw new Error("Booking endpoint not found (404). Backend might not be deployed.");
      }

      if (!res.ok) throw new Error(data.error?.errors?.[0]?.detail || "Booking failed");

      // Success!
      navigate(`/flights/confirm/${data.data.id}`, { 
        state: { bookingResponse: data.data } 
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
      setBookingLoading(false);
    }
  };

  if (!pricedOffer) return <div>Missing flight data. <button onClick={() => navigate('/')}>Home</button></div>;

  return (
    <div className="seatmap-page-container">
      <h2>Select Your Seat</h2>
      
      {loading && <p>Loading seat map...</p>}
      
      {/* If map fails, we show error but allow booking anyway */}
      {error && !seatMapData && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={handleConfirmBooking} className="skip-btn" disabled={bookingLoading}>
            {bookingLoading ? "Booking..." : "Skip Seat Selection & Book Flight"}
          </button>
        </div>
      )}

      {seatMapData && (
        <div className="seatmap-wrapper">
          {seatMapData.map((segmentMap, index) => (
            <div key={index} className="segment-map">
              <h3>Flight Segment {index + 1} ({segmentMap.departure.iataCode} - {segmentMap.arrival.iataCode})</h3>
              {segmentMap.decks.map((deck) => (
                <div key={deck.deckType} className="deck">
                  {deck.rows.map((row) => (
                    <div key={row.number} className="seat-row">
                      <span className="row-num">{row.number}</span>
                      {row.seats.map((seat) => {
                         const isAvailable = seat.travelerPricing[0].seatAvailabilityStatus === 'AVAILABLE';
                         const isSelected = selectedSeat === seat.number;
                         let className = "seat";
                         if (!isAvailable) className += " occupied";
                         if (isSelected) className += " selected";
                         
                         if (seat.cabin.includes('AISLE') && !className.includes('occupied')) {
                            if(['C', 'D', 'G', 'H'].includes(seat.number.slice(-1))) className += " aisle-gap";
                         }

                         return (
                           <div 
                             key={seat.number} 
                             className={className}
                             onClick={() => isAvailable && setSelectedSeat(seat.number)}
                           >
                             {seat.number.slice(-1)}
                           </div>
                         );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
          
          <div className="seat-footer">
            <div className="selected-info">
                Selected Seat: <strong>{selectedSeat || "None"}</strong>
            </div>
            <button 
              onClick={handleConfirmBooking} 
              className="confirm-btn"
              disabled={bookingLoading}
            >
              {bookingLoading ? "Processing Booking..." : "Confirm & Book Flight"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}