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

    // Prepare the data to pass to the Seat Map page
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

    // NAVIGATE to Seat Map Page
    navigate("/flights/seatmap", { 
      state: { 
        pricedOffer: pricedOffer,
        travelerInfo: travelerInfo 
      } 
    });
  };

  if (!pricedOffer) {
    return <div>No flight selected. <button onClick={() => navigate('/')}>Go Home</button></div>;
  }

  return (
    <div className="passenger-container">
      <form onSubmit={handleContinueToSeatMap} className="passenger-form">
        <h2>Passenger Information</h2>
        
        <div className="form-section">
          <h3>Personal Details</h3>
          <div className="form-grid">
            <input name="firstName" placeholder="First Name" onChange={handleChange} required />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
            <select name="gender" onChange={handleChange} value={traveler.gender} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <div>
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Details</h3>
          <div className="form-grid">
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            <input name="countryCode" placeholder="Country Code (e.g., 1)" onChange={handleChange} value={traveler.countryCode} required />
            <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-section">
          <h3>Passport / Travel Document</h3>
          <div className="form-grid">
            <input name="passportNumber" placeholder="Passport Number" onChange={handleChange} required />
            <input name="passportCountry" placeholder="Passport Country (2-letter code, e.g., NP)" onChange={handleChange} maxLength="2" required />
            <div>
              <label>Passport Expiry Date</label>
              <input name="passportExpiry" type="date" onChange={handleChange} required />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-booking">
          Select Seats
        </button>
      </form>
    </div>
  );
}