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

  // 1. Fetch Seat Map on Load
  useEffect(() => {
    if (!pricedOffer) return;

    const fetchSeatMap = async () => {
      try {
        // --- FIX: URL Construction ---
        // config.js = https://backend1-cube.onrender.com
        // We add: /api/seatmaps
        // Result: https://backend1-cube.onrender.com/api/seatmaps (CORRECT)
        const res = await fetch(`${API_BASE_URL}/api/seatmaps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pricedOffer: pricedOffer }),
        });
        
        // Check for HTML/404 response
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Seat map service unavailable (Backend Connection Error).");
        }

        const data = await res.json();
        
        if (!res.ok) {
            // Amadeus Test API often fails here. catch it gracefully.
            throw new Error("Seat map not supported for this test flight.");
        }
        setSeatMapData(data.data);
      } catch (err) {
        console.warn("Seat Map Warning:", err.message);
        setError("Seat selection is not available for this test flight. You can proceed to booking.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [pricedOffer]);

  // 2. Final Booking Function
  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setError('');

    try {
      // --- FIX: URL Construction here too ---
      const res = await fetch(`${API_BASE_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightOffer: pricedOffer,
          travelerInfo: travelerInfo,
          selectedSeat: selectedSeat 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.errors?.[0]?.detail || "Booking failed");

      navigate(`/flights/confirm/${data.data.id}`, { 
        state: { bookingResponse: data.data } 
      });

    } catch (err) {
      setError(err.message);
      setBookingLoading(false);
    }
  };

  if (!pricedOffer) return <div>Missing flight data. <button onClick={() => navigate('/')}>Home</button></div>;

  return (
    <div className="seatmap-page-container">
      <h2>Select Your Seat</h2>
      
      {loading && <p>Loading seat map...</p>}
      
      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={handleConfirmBooking} className="skip-btn">
            Skip Seat Selection & Book Flight
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
                             title={`${seat.number} - $${seat.travelerPricing[0].price.total}`}
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