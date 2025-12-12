// src/components/SeatMapPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import './SeatMap.css'; // Uses the CSS from the next step

export default function SeatMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data passed from PassengerFormPage
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
        const res = await fetch(`${API_BASE_URL}/api/seatmaps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pricedOffer: pricedOffer }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error("Seat map not available for this flight.");
        setSeatMapData(data.data);
      } catch (err) {
        setError(err.message);
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
      const res = await fetch(`${API_BASE_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightOffer: pricedOffer,
          travelerInfo: travelerInfo,
          selectedSeat: selectedSeat // Pass the seat choice
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.errors?.[0]?.detail || "Booking failed");

      // Success! Go to Confirmation
      navigate(`/flights/confirm/${data.data.id}`, { 
        state: { bookingResponse: data.data } 
      });

    } catch (err) {
      setError(err.message);
      setBookingLoading(false);
    }
  };

  if (!pricedOffer) return <div>Missing flight data.</div>;

  return (
    <div className="seatmap-page-container">
      <h2>Select Your Seat</h2>
      
      {loading && <p>Loading seat map...</p>}
      
      {error && (
        <div className="error-box">
          <p>{error}</p>
          {/* Allow booking without seat if map fails */}
          <button onClick={handleConfirmBooking} className="skip-btn">
            Skip Seat Selection & Book
          </button>
        </div>
      )}

      {seatMapData && (
        <div className="seatmap-wrapper">
          {seatMapData.map((segmentMap, index) => (
            <div key={index} className="segment-map">
              <h3>Flight Segment {index + 1}</h3>
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
        </div>
      )}

      <div className="seat-footer">
        <p>Selected Seat: <strong>{selectedSeat || "None"}</strong></p>
        <button 
          onClick={handleConfirmBooking} 
          className="confirm-btn"
          disabled={bookingLoading}
        >
          {bookingLoading ? "Booking..." : "Confirm & Book"}
        </button>
      </div>
    </div>
  );
}