// import React, { useState } from "react";
// import { BASE_URL } from "../config";
// import "./ManualHotelForm.css";

// export default function ManualHotelForm() {
//   const [city, setCity] = useState("");
//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setResults([]);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${BASE_URL}/koalaroute/hotels`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({ city, checkIn, checkOut }),
//       });

//       const data = await res.json();
//       setResults(data.hotels || []);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to fetch hotels");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="hotel-form-container">
//       <h3>Search Hotels</h3>
//       <form onSubmit={handleSearch} className="hotel-form">
//         <input
//           type="text"
//           placeholder="City"
//           value={city}
//           onChange={(e) => setCity(e.target.value)}
//           required
//         />
//         <input
//           type="date"
//           placeholder="Check-in"
//           value={checkIn}
//           onChange={(e) => setCheckIn(e.target.value)}
//           required
//         />
//         <input
//           type="date"
//           placeholder="Check-out"
//           value={checkOut}
//           onChange={(e) => setCheckOut(e.target.value)}
//           required
//         />
//         <button type="submit">{loading ? "Searching..." : "Search"}</button>
//       </form>

//       {results.length > 0 && (
//         <div className="hotel-results">
//           {results.map((h, idx) => (
//             <div key={idx} className="hotel-card">
//               <p>
//                 {h.name} - {h.city}
//               </p>
//               <p>Rating: {h.rating}</p>
//               <p>Price: ${h.price}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// dummy details
import React, { useState } from "react";
import "./ManualHotelForm.css";

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
  const [filtersVisible, setFiltersVisible] = useState(false);

  const popularCities = [
    "New York",
    "Paris",
    "Tokyo",
    "London",
    "Dubai",
    "Bali",
    "Rome",
    "Barcelona",
    "Sydney",
    "Singapore",
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    // Simulate API delay
    setTimeout(() => {
      const dummyHotels = [
        {
          id: 1,
          name: "Grand Plaza Hotel",
          city,
          rating: 4.5,
          price: 120,
          image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: ["Free WiFi", "Swimming Pool", "Spa", "Restaurant"],
          reviewCount: 324,
          discount: 15,
        },
        {
          id: 2,
          name: "City View Inn",
          city,
          rating: 4.0,
          price: 90,
          image:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: ["Free WiFi", "Breakfast Included", "Fitness Center"],
          reviewCount: 218,
          discount: 0,
        },
        {
          id: 3,
          name: "Ocean Breeze Resort",
          city,
          rating: 5.0,
          price: 200,
          image:
            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: [
            "Beachfront",
            "Free WiFi",
            "Swimming Pool",
            "Spa",
            "Restaurant",
            "Bar",
          ],
          reviewCount: 512,
          discount: 25,
        },
        {
          id: 4,
          name: "Mountain Stay Lodge",
          city,
          rating: 4.2,
          price: 150,
          image:
            "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: ["Free WiFi", "Mountain View", "Fireplace", "Restaurant"],
          reviewCount: 187,
          discount: 10,
        },
        {
          id: 5,
          name: "Urban Chic Boutique",
          city,
          rating: 4.7,
          price: 180,
          image:
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: [
            "Free WiFi",
            "Rooftop Bar",
            "Fitness Center",
            "Restaurant",
          ],
          reviewCount: 276,
          discount: 0,
        },
        {
          id: 6,
          name: "Historic Grand Hotel",
          city,
          rating: 4.8,
          price: 220,
          image:
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: ["Free WiFi", "Historic Building", "Spa", "Fine Dining"],
          reviewCount: 432,
          discount: 20,
        },
      ];

      // Apply price filter
      const filteredHotels = dummyHotels.filter(
        (hotel) => hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
      );

      // Apply sorting
      let sortedHotels = [...filteredHotels];
      if (sortBy === "price") {
        sortedHotels.sort((a, b) => a.price - b.price);
      } else if (sortBy === "rating") {
        sortedHotels.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "recommended") {
        // Recommended is a mix of rating and review count
        sortedHotels.sort(
          (a, b) =>
            b.rating * 2 +
            b.reviewCount / 100 -
            (a.rating * 2 + a.reviewCount / 100)
        );
      }

      setResults(sortedHotels);
      setLoading(false);
    }, 1500);
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star full">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ★
        </span>
      );
    }

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
            <div className="input-group">
              <label>Destination</label>
              <div className="input-with-icon">
                <span className="icon">📍</span>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="popular-cities">
                <span>Popular: </span>
                {popularCities.map((cityName, index) => (
                  <button
                    key={index}
                    type="button"
                    className="city-chip"
                    onClick={() => handleCitySelect(cityName)}
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Check-in</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Check-out</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  min={checkIn || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Guests & Rooms</label>
              <div className="guest-room-selector">
                <div className="selector">
                  <span>👤</span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="selector">
                  <span>🛏️</span>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Room" : "Rooms"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="filter-toggle"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </button>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  <span className="search-icon">🔍</span>
                  Search Hotels
                </>
              )}
            </button>
          </div>

          {filtersVisible && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Price Range (per night)</label>
                <div className="price-range">
                  <span>${priceRange[0]}</span>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="price-slider"
                  />
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div className="filter-group">
                <label>Sort by</label>
                <div className="sort-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="sort"
                      value="recommended"
                      checked={sortBy === "recommended"}
                      onChange={() => setSortBy("recommended")}
                    />
                    <span>Recommended</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="sort"
                      value="price"
                      checked={sortBy === "price"}
                      onChange={() => setSortBy("price")}
                    />
                    <span>Price (Low to High)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="sort"
                      value="rating"
                      checked={sortBy === "rating"}
                      onChange={() => setSortBy("rating")}
                    />
                    <span>Rating (High to Low)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>

        {results.length > 0 && (
          <div className="results-container">
            <div className="results-header">
              <h2>Available Hotels in {city}</h2>
              <p>{results.length} properties found</p>
            </div>

            <div className="hotel-results">
              {results.map((hotel) => (
                <div key={hotel.id} className="hotel-card">
                  <div className="hotel-image">
                    <img src={hotel.image} alt={hotel.name} />
                    {hotel.discount > 0 && (
                      <div className="discount-badge">-{hotel.discount}%</div>
                    )}
                  </div>
                  <div className="hotel-details">
                    <h3>{hotel.name}</h3>
                    <p className="hotel-location">{hotel.city}</p>

                    <div className="rating">
                      <div className="stars">{renderStars(hotel.rating)}</div>
                      <span className="rating-value">{hotel.rating}/5</span>
                      <span className="review-count">
                        ({hotel.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="amenities">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="amenity-more">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="price-section">
                      <div className="price">
                        <span className="final-price">${hotel.price}</span>
                        <span className="per-night">/night</span>
                        {hotel.discount > 0 && (
                          <span className="original-price">
                            $
                            {(hotel.price / (1 - hotel.discount / 100)).toFixed(
                              0
                            )}
                          </span>
                        )}
                      </div>
                      <button className="book-button">Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
