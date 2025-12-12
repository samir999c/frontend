// src/components/PassengerFormPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PassengerFormPage.css'; 

export default function PassengerFormPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { pricedOffer } = location.state || {};

  const [traveler, setTraveler] = useState({
    id: '1',
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    email: '',
    phone: '',
    countryCode: '1', 
    passportNumber: '',
    passportExpiry: '',
    passportCountry: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTraveler((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinueToSeatMap = (e) => {
    e.preventDefault();

    const travelerInfo = {
      id: traveler.id,
      dateOfBirth: traveler.dateOfBirth,
      name: { firstName: traveler.firstName, lastName: traveler.lastName },
      gender: traveler.gender,
      email: traveler.email,
      phone: traveler.phone,
      countryCode: traveler.countryCode,
      passportNumber: traveler.passportNumber,
      passportExpiry: traveler.passportExpiry,
      passportCountry: traveler.passportCountry,
    };

    navigate("/flights/seatmap", { 
      state: { 
        pricedOffer: pricedOffer,
        travelerInfo: travelerInfo 
      } 
    });
  };

  if (!pricedOffer) {
    return (
      <div className="passenger-error-container">
        <h2>No Flight Selected</h2>
        <p>Please go back and search for a flight.</p>
        <button onClick={() => navigate('/')} className="secondary-btn">Go Home</button>
      </div>
    );
  }

  // Helper to format price
  const currency = pricedOffer.price.currency;
  const total = pricedOffer.price.total;

  return (
    <div className="passenger-page-wrapper">
      <div className="passenger-content-container">
        
        {/* --- LEFT COLUMN: THE FORM --- */}
        <div className="form-card">
          <div className="form-header">
            <h2>Passenger Details</h2>
            <p>Enter details exactly as they appear on your passport.</p>
          </div>

          <form onSubmit={handleContinueToSeatMap} className="passenger-form">
            
            {/* Section 1: Personal */}
            <h3 className="section-title">Personal Information</h3>
            <div className="form-row">
              <div className="input-group">
                <label>First Name</label>
                <input name="firstName" type="text" placeholder="e.g. John" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input name="lastName" type="text" placeholder="e.g. Doe" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Date of Birth</label>
                <input name="dateOfBirth" type="date" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" onChange={handleChange} value={traveler.gender} required>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            {/* Section 2: Contact */}
            <h3 className="section-title">Contact Details</h3>
            <div className="input-group full-width">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
            </div>
            
            <div className="form-row">
              <div className="input-group small">
                <label>Country Code</label>
                <input name="countryCode" type="text" placeholder="1" value={traveler.countryCode} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" placeholder="e.g. 5551234567" onChange={handleChange} required />
              </div>
            </div>

            {/* Section 3: Passport */}
            <h3 className="section-title">Passport Information</h3>
            <div className="form-row">
              <div className="input-group">
                <label>Passport Number</label>
                <input name="passportNumber" type="text" placeholder="Passport No." onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Issuing Country</label>
                <input 
                  name="passportCountry" 
                  type="text" 
                  placeholder="2-Letter Code (e.g. US, AU)" 
                  maxLength="2" 
                  style={{textTransform: 'uppercase'}}
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="input-group half-width">
              <label>Passport Expiry</label>
              <input name="passportExpiry" type="date" onChange={handleChange} required />
            </div>

            <button type="submit" className="continue-btn">
              Select Seats & Continue →
            </button>
          </form>
        </div>

        {/* --- RIGHT COLUMN: SUMMARY SIDEBAR --- */}
        <div className="summary-card">
          <h3>Trip Summary</h3>
          <div className="summary-route">
            <div className="route-point">
              <span className="code">{pricedOffer.itineraries[0].segments[0].departure.iataCode}</span>
              <span className="label">Origin</span>
            </div>
            <div className="route-arrow">➝</div>
            <div className="route-point">
              <span className="code">{pricedOffer.itineraries[0].segments.slice(-1)[0].arrival.iataCode}</span>
              <span className="label">Dest</span>
            </div>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="price-row">
            <span>Base Fare</span>
            <span>{total} {currency}</span>
          </div>
          <div className="price-row total">
            <span>Total</span>
            <span>{total} {currency}</span>
          </div>
        </div>

      </div>
    </div>
  );
}