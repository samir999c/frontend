// src/components/BookingConfirmationPage.jsx

import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import './BookingConfirmationPage.css';

// Helper function to format date/time for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BookingConfirmationPage() {
  const { orderId } = useParams(); // Get the order ID from the URL
  const location = useLocation();
  const { bookingResponse } = location.state || {}; // Get the full response passed from PassengerFormPage

  if (!bookingResponse) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-icon error">✖</div>
          <h2>Booking Error</h2>
          <p>We couldn't retrieve your booking details. Please check your email or contact support.</p>
          <p>Your potential Order ID: <strong>{orderId}</strong></p>
          <Link to="/koalaroute" className="home-button">Start New Search</Link>
        </div>
      </div>
    );
  }

  // Safely access data from the Amadeus Flight Order response
  const { travelers, flightOffers } = bookingResponse;
  const itinerary = flightOffers[0].itineraries[0]; 
  const traveler = travelers[0]; 

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-icon success">✓</div>
        <h2>Booking Confirmed!</h2>
        <p className="confirmation-lead">
          Your flight is successfully booked. An itinerary confirmation has been sent to <strong>{traveler.contact.emailAddress}</strong>.
        </p>

        <div className="confirmation-details">
          <h3>Your Order ID</h3>
          <p className="order-id">{orderId}</p>

          <h3>Traveler Details</h3>
          <p>{traveler.name.firstName} {traveler.name.lastName} ({traveler.gender})</p>
          <p>D.O.B: {traveler.dateOfBirth}</p>

          <h3>Flight Summary</h3>
          {itinerary.segments.map((segment, index) => (
            <div key={index} className="segment-card">
              <div className="segment-header">
                <strong>{segment.departure.iataCode} → {segment.arrival.iataCode}</strong>
                <span>{segment.carrierCode} {segment.number}</span>
              </div>
              <div className="segment-body">
                <div>
                  <strong>Departure:</strong>
                  <p>{formatDate(segment.departure.at)}</p>
                </div>
                <div>
                  <strong>Arrival:</strong>
                  <p>{formatDate(segment.arrival.at)}</p>
                </div>
              </div>
              <p className="segment-duration">Duration: {segment.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</p>
            </div>
          ))}
        </div>

        <Link to="/koalaroute" className="home-button">
          Book Another Trip
        </Link>
      </div>
    </div>
  );
}