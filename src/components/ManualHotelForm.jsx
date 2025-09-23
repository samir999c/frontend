import React, { useState } from "react";
import { API_BASE_URL } from "../config"; // Make sure this points to your backend
import "./ManualHotelForm.css"; // Assumes you have the advanced CSS

export default function ModernHotelForm() {
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [sortBy, setSortBy] = useState("recommended");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const popularCities = ["New York", "Paris", "Tokyo", "London", "Sydney"];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setError("");

    // Use a real Hotel Search API (like Amadeus, RapidAPI, etc.)
    // For now, we connect to a placeholder endpoint on your backend
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/hotels/search`, { // Connect to your backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          city,
          checkIn,
          checkOut,
          guests,
          rooms,
          priceRange,
          sortBy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch hotels.");
      }
      
      // The backend should return a sorted and filtered list
      setResults(data.hotels || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
  };

  const renderStars = (rating) => {
    // Star rendering logic from your example
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<span key={i} className="star full">★</span>);
    if (hasHalfStar) stars.push(<span key="half" className="star half">★</span>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    return stars;
  };

  return (
    <div className="modern-hotel-app">
      <div className="hotel-form-container">
        <div className="form-header">
          <h1>Find Your Perfect Stay</h1>
          <p>Discover amazing hotels at the best prices</p>
        </div>

        <form onSubmit={handleSearch} className="hotel-form">
          <div className="form-grid">
            {/* All your advanced form JSX... */}
            <div className="input-group">
              <label>Destination</label>
              <div className="input-with-icon">
                <span className="icon">📍</span>
                <input type="text" placeholder="Where are you going?" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="popular-cities">
                <span>Popular: </span>
                {popularCities.map((cityName, index) => (
                  <button key={index} type="button" className="city-chip" onClick={() => handleCitySelect(cityName)}>
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Check-in</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>

            <div className="input-group">
              <label>Check-out</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required min={checkIn || new Date().toISOString().split("T")[0]} />
              </div>
            </div>

            <div className="input-group">
              <label>Guests & Rooms</label>
              <div className="guest-room-selector">
                <div className="selector">
                  <span>👤</span>
                  <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((num) => (<option key={num} value={num}>{num} {num === 1 ? "Guest" : "Guests"}</option>))}
                  </select>
                </div>
                <div className="selector">
                  <span>🛏️</span>
                  <select value={rooms} onChange={(e) => setRooms(parseInt(e.target.value))}>
                    {[1, 2, 3, 4].map((num) => (<option key={num} value={num}>{num} {num === 1 ? "Room" : "Rooms"}</option>))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="filter-toggle" onClick={() => setFiltersVisible(!filtersVisible)}>
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <><span className="spinner"></span> Searching...</> : <><span className="search-icon">🔍</span> Search Hotels</>}
            </button>
          </div>
          
          {/* Your filters panel JSX... */}

        </form>

        {error && <p className="error-text" style={{textAlign: 'center', marginTop: '20px'}}>{error}</p>}

        {results.length > 0 && !loading && (
          <div className="results-container">
            {/* Your advanced results display JSX... */}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Finding the best hotels for you...</p>
          </div>
        )}
      </div>
    </div>
  );
}