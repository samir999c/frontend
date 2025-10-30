// src/components/PassengerFormPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import './PassengerFormPage.css'; // We will create this CSS file next

export default function PassengerFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Get the pricedOffer from the previous page (FlightResultsPage)
  const { pricedOffer } = location.state || {};

  // We only have one traveler form for now, as the backend supports one traveler
  const [traveler, setTraveler] = useState({
    id: '1',
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    email: '',
    phone: '',
    passportNumber: '',
    passportExpiry: '',
    passportCountry: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes for the traveler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTraveler((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. This function calls your /book backend endpoint
  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!pricedOffer) {
      setError('No flight offer selected. Please go back and select a flight.');
      return;
    }

    setLoading(true);

    try {
      // Structure the data exactly as your backend /book endpoint expects
      const bookingData = {
        flightOffer: pricedOffer,
        travelerInfo: traveler,
      };

      const res = await fetch(`${API_BASE_URL}/amadeus/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Try to show a useful error from Amadeus
        const amadeusError = data.error?.errors?.[0]?.detail || data.msg || 'Booking failed.';
        throw new Error(amadeusError);
      }
      
      // 4. SUCCESS! Navigate to the confirmation page
      // We pass the new order ID from the response
      const orderId = data.data.id;
      navigate(`/flights/confirm/${orderId}`, { state: { bookingResponse: data.data } });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!pricedOffer) {
    return (
      <div className="passenger-form-container">
        <h2>Error</h2>
        <p>No flight offer was found. Please go back to search.</p>
        <button onClick={() => navigate('/koalaroute')}>Back to Search</button>
      </div>
    );
  }

  // Display a summary of the flight being booked
  const { itineraries, price } = pricedOffer;

  return (
    <div className="passenger-form-container">
      <div className="flight-summary-sidebar">
        <h3>Your Flight</h3>
        {itineraries.map((itinerary, idx) => (
          <div key={idx} className="summary-itinerary">
            <strong>{idx === 0 ? 'Outbound' : 'Return'}</strong>
            {itinerary.segments.map((seg, segIdx) => (
              <p key={segIdx} className="summary-segment">
                {seg.departure.iataCode} → {seg.arrival.iataCode}
              </p>
            ))}
          </div>
        ))}
        <hr />
        <div className="summary-price">
          <span>Total:</span>
          <strong>{price.total} {price.currency}</strong>
        </div>
      </div>

      <form className="passenger-form" onSubmit={handleBooking}>
        <h2>Passenger Information</h2>
        <p>Please enter details for Traveler 1 (Adult)</p>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={traveler.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={traveler.lastName} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={traveler.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={traveler.gender} onChange={handleChange} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        <h3>Contact Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={traveler.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number (e.g., 412345678)</label>
            <input type="tel" name="phone" value={traveler.phone} onChange={handleChange} required />
          </div>
        </div>

        <h3>Travel Document (Passport)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Passport Number</label>
            <input type="text" name="passportNumber" value={traveler.passportNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Passport Expiry Date</label>
            <input type="date" name="passportExpiry" value={traveler.passportExpiry} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Passport Issuing Country (2-Letter Code, e.g., AU)</label>
            <input
              type="text"
              name="passportCountry"
              value={traveler.passportCountry}
              onChange={handleChange}
              maxLength="2"
              minLength="2"
              style={{ textTransform: 'uppercase' }}
              placeholder="AU"
              required
            />
          </div>
        </div>
        
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="book-now-button" disabled={loading}>
          {loading ? 'Booking...' : 'Confirm and Book'}
        </button>
      </form>
    </div>
  );
}