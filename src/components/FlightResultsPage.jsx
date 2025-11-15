import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import "./FlightResultsPage.css"; // We will update this file



export default function FlightResultsPage() {

  const location = useLocation();

  const navigate = useNavigate();

 

  const { flights, dictionaries } = location.state || { flights: [], dictionaries: {} };



  if (!flights || flights.length === 0) {

    return (

      <div className="flight-results-container">

        <h2>No Flights Found</h2>

        <p>Your search returned no results. Please try again.</p>

        <button onClick={() => navigate("/koalaroute")}>Back to Search</button>

      </div>

      );
    
    }

  }



  // --- NEW HELPER FUNCTIONS for better display ---

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

      month: 'short',

      day: 'numeric'

    });

  };

  // ------------------------------------------



  const getAirlineName = (carrierCode) => {

    return dictionaries?.carriers?.[carrierCode] || carrierCode;

  };



  // --- UPDATED RENDER FUNCTION to show times ---

  const renderItinerarySummary = (itinerary) => {

    if (!itinerary?.segments) return <p>Flight details unavailable.</p>;



    // Get first segment

    const firstSegment = itinerary.segments[0];

    // Get last segment

    const lastSegment = itinerary.segments[itinerary.segments.length - 1];



    return (

      <div className="itinerary-summary">

        <div className="segment-summary">

          <div className="time-iata">

            <strong>{formatTime(firstSegment.departure.at)}</strong>

            <span>{firstSegment.departure.iataCode}</span>

          </div>

          <div className="route-line-summary"></div>

          <div className="time-iata">

            <strong>{formatTime(lastSegment.arrival.at)}</strong>

            <span>{lastSegment.arrival.iataCode}</span>

          </div>

        </div>

        <div className="airline-summary">

          {itinerary.segments.map(s => getAirlineName(s.carrierCode)).join(' → ')}

        </div>

        <div className="duration-summary">

          Duration: {itinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}

        </div>

      </div>

    );

  };

  // ------------------------------------------



  // --- UPDATED HANDLER: Navigates to details page ---

  const handleSelectFlight = (flightOffer) => {

    // We don't price check here anymore. We do it on the details page.

    // Just navigate and pass the offer and dictionaries.

    navigate("/flights/details", {

      state: {

        offer: flightOffer,

        dictionaries: dictionaries

      }

    });

  };

  // ------------------------------------------------



  return (

    <div className="flight-results-container">

      <h2>Flight Results</h2>

      <div className="flights-list">

        {flights.map((offer) => (

          <div key={offer.id} className="flight-card">

            <div className="flight-details">

              {offer?.itineraries?.map((itinerary, index) => (

                <div key={index} className="itinerary-block">

                  <strong>{index === 0 ? "Outbound" : "Return"}</strong>

                  {renderItinerarySummary(itinerary)}

                </div>

              ))}

            </div>

            <div className="booking-section">

              <div className="price">{offer?.price?.total || 'N/A'} <span>{offer?.price?.currency || ''}</span></div>

              <button

                onClick={() => handleSelectFlight(offer)}

                className="book-now-button"

              >

                Select Flight

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
