// import React, { useState } from "react";
// import { API_BASE_URL } from "../config";
// import "./ManualFlightForm.css";

// export default function ManualFlightForm() {
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [departure, setDeparture] = useState("");
//   const [returnDate, setReturnDate] = useState("");
//   const [currency, setCurrency] = useState("usd");
//   const [passengers, setPassengers] = useState(1);
//   const [tripClass, setTripClass] = useState("Y");
//   const [flights, setFlights] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [searchStatus, setSearchStatus] = useState("");
//   const [searchId, setSearchId] = useState("");

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setError("");
//     setFlights([]);
//     setSearchId("");
//     //updating

//     if (!origin || !destination || !departure) {
//       setError("Origin, destination, and departure date are required.");
//       return;
//     }

//     setLoading(true);
//     setSearchStatus("Initializing flight search...");

//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("You are not authenticated.");
//       setLoading(false);
//       setSearchStatus("");
//       return;
//     }

//     try {
//       // Initialize search using the correct API_BASE_URL
//       // const res = await fetch(`${API_BASE_URL}/koalaroute/flights`, {
//       const res = await fetch(`${API_BASE_URL}/aviasales/search`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           origin,
//           destination,
//           departure_at: departure,
//           return_at: returnDate,
//           currency,
//           passengers,
//           trip_class: tripClass,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         // Handle authentication errors specifically   m
//         if (res.status === 401) {
//           throw new Error("API authentication failed. Please contact support.");
//         }
//         throw new Error(data.error || "Failed to initialize flight search");
//       }

//       // Set search ID for potential polling
//       setSearchId(data.search_id);

//       if (data.data && data.data.length > 0) {
//         // Results are immediately available
//         setFlights(data.data);
//         setSearchStatus("");
//       } else {
//         // If results aren't immediately available, show waiting message
//         setSearchStatus(
//           "Searching for flights. This may take up to a minute..."
//         );

//         // Poll for results
//         pollForResults(data.search_id, token);
//       }
//     } catch (err) {
//       console.error("Flight search error:", err);
//       setError(err.message);
//       setSearchStatus("");
//       setLoading(false);
//     }
//   };

//   const pollForResults = async (searchId, token) => {
//     let attempts = 0;
//     const maxAttempts = 10;

//     const poll = async () => {
//       attempts++;

//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/koalaroute/flights/${searchId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.error || "Failed to fetch flight results");
//         }

//         if (data.data && data.data.length > 0) {
//           // We have results
//           setFlights(data.data);
//           setSearchStatus("");
//           setLoading(false);
//           return;
//         } else if (attempts < maxAttempts) {
//           // Continue polling
//           setSearchStatus(
//             `Searching for flights... (Attempt ${attempts}/${maxAttempts})`
//           );
//           setTimeout(poll, 5000); // Poll every 5 seconds
//         } else {
//           // Max attempts reached
//           setError("Flight search timeout. Please try again.");
//           setSearchStatus("");
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Polling error:", err);
//         if (attempts < maxAttempts) {
//           setTimeout(poll, 5000);
//         } else {
//           setError("Flight search failed. Please try again.");
//           setSearchStatus("");
//           setLoading(false);
//         }
//       }
//     };

//     // Start polling
//     poll();
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   return (
//     <div className="manual-flight-form">
//       <h2>Search Flights</h2>
//       <form onSubmit={handleSearch}>
//         <div className="form-row">
//           <div className="form-group">
//             <label>Origin (IATA code)</label>
//             <input
//               type="text"
//               placeholder="e.g., NYC"
//               value={origin}
//               onChange={(e) => setOrigin(e.target.value.toUpperCase())}
//               maxLength={3}
//             />
//           </div>

//           <div className="form-group">
//             <label>Destination (IATA code)</label>
//             <input
//               type="text"
//               placeholder="e.g., LON"
//               value={destination}
//               onChange={(e) => setDestination(e.target.value.toUpperCase())}
//               maxLength={3}
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Departure Date</label>
//             <input
//               type="date"
//               value={departure}
//               onChange={(e) => setDeparture(e.target.value)}
//               min={new Date().toISOString().split("T")[0]}
//             />
//           </div>

//           <div className="form-group">
//             <label>Return Date (optional)</label>
//             <input
//               type="date"
//               value={returnDate}
//               onChange={(e) => setReturnDate(e.target.value)}
//               min={departure || new Date().toISOString().split("T")[0]}
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Passengers</label>
//             <select
//               value={passengers}
//               onChange={(e) => setPassengers(parseInt(e.target.value))}
//             >
//               {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
//                 <option key={num} value={num}>
//                   {num}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Class</label>
//             <select
//               value={tripClass}
//               onChange={(e) => setTripClass(e.target.value)}
//             >
//               <option value="Y">Economy</option>
//               <option value="C">Business</option>
//               <option value="F">First</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Currency</label>
//             <select
//               value={currency}
//               onChange={(e) => setCurrency(e.target.value)}
//             >
//               <option value="usd">USD</option>
//               <option value="eur">EUR</option>
//               <option value="gbp">GBP</option>
//             </select>
//           </div>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Searching..." : "Search Flights"}
//         </button>
//       </form>

//       {searchStatus && <div className="search-status">{searchStatus}</div>}
//       {error && <p className="error-text">{error}</p>}

//       {flights.length > 0 && (
//         <div className="results-container">
//           <h3>Found {flights.length} Flights</h3>
//           <div className="flights-list">
//             {flights.map((flight, index) => (
//               <div key={index} className="flight-card">
//                 <div className="flight-header">
//                   <div className="airline">
//                     {flight.airline || "Multiple Airlines"}
//                   </div>
//                   <div className="price">
//                     {flight.price} {flight.currency}
//                   </div>
//                 </div>

//                 <div className="flight-details">
//                   <div className="route">
//                     <div className="segment">
//                       <div className="city">{flight.origin}</div>
//                       <div className="time">
//                         {formatTime(flight.departure_at)}
//                       </div>
//                       <div className="date">
//                         {formatDate(flight.departure_at)}
//                       </div>
//                     </div>

//                     <div className="arrow">→</div>

//                     <div className="segment">
//                       <div className="city">{flight.destination}</div>
//                       <div className="time">
//                         {formatTime(flight.arrival_at)}
//                       </div>
//                       <div className="date">
//                         {formatDate(flight.arrival_at)}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flight-info">
//                     <div className="info-item">
//                       <span className="label">Duration:</span>
//                       <span className="value">{flight.duration} min</span>
//                     </div>

//                     <div className="info-item">
//                       <span className="label">Transfers:</span>
//                       <span className="value">{flight.transfers || 0}</span>
//                     </div>

//                     <div className="info-item">
//                       <span className="label">Flight number:</span>
//                       <span className="value">
//                         {flight.flight_number || "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <button className="select-flight">Select Flight</button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// updated
// import React, { useState } from "react";
// import { API_BASE_URL } from "../config";
// import "./ManualFlightForm.css";

// export default function ManualFlightForm() {
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [departure, setDeparture] = useState("");
//   const [returnDate, setReturnDate] = useState("");
//   const [currency, setCurrency] = useState("usd");
//   const [passengers, setPassengers] = useState(1);
//   const [tripClass, setTripClass] = useState("Y");
//   const [flights, setFlights] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [searchStatus, setSearchStatus] = useState("");
//   // tension

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setError("");
//     setFlights([]);
//     setSearchStatus("");

//     if (!origin || !destination || !departure) {
//       setError("Origin, destination, and departure date are required.");
//       return;
//     }

//     setLoading(true);
//     setSearchStatus("Searching for flights...");

//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(`${API_BASE_URL}/aviasales/search`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({
//           origin,
//           destination,
//           departure,
//           returnDate,
//           passengers,
//           tripClass,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || data.details || "Flight search failed");
//       }

//       if (data.data && data.data.length > 0) {
//         setFlights(data.data);
//         setSearchStatus("");
//       } else {
//         setSearchStatus("No flights found for these dates.");
//       }
//     } catch (err) {
//       console.error("Flight search error:", err);
//       setError(err.message);
//       setSearchStatus("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="manual-flight-form">
//       <h2>Search Flights</h2>
//       <form onSubmit={handleSearch}>
//         <div className="form-row">
//           <input
//             type="text"
//             placeholder="Origin (NYC)"
//             value={origin}
//             onChange={(e) => setOrigin(e.target.value.toUpperCase())}
//             maxLength={3}
//           />
//           <input
//             type="text"
//             placeholder="Destination (LAX)"
//             value={destination}
//             onChange={(e) => setDestination(e.target.value.toUpperCase())}
//             maxLength={3}
//           />
//         </div>
//         <div className="form-row">
//           <input
//             type="date"
//             value={departure}
//             onChange={(e) => setDeparture(e.target.value)}
//           />
//           <input
//             type="date"
//             value={returnDate}
//             onChange={(e) => setReturnDate(e.target.value)}
//             min={departure}
//           />
//         </div>
//         <div className="form-row">
//           <select
//             value={passengers}
//             onChange={(e) => setPassengers(parseInt(e.target.value))}
//           >
//             {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
//               <option key={num} value={num}>
//                 {num}
//               </option>
//             ))}
//           </select>
//           <select
//             value={tripClass}
//             onChange={(e) => setTripClass(e.target.value)}
//           >
//             <option value="Y">Economy</option>
//             <option value="C">Business</option>
//             <option value="F">First</option>
//           </select>
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? "Searching..." : "Search Flights"}
//         </button>
//       </form>

//       {searchStatus && <div>{searchStatus}</div>}
//       {error && <div style={{ color: "red" }}>{error}</div>}

//       {flights.length > 0 && (
//         <div className="flights-list">
//           {flights.map((f, i) => (
//             <div key={i} className="flight-card">
//               <div>
//                 {f.airline || "Multiple Airlines"} - {f.price} RUB
//               </div>
//               <div>
//                 {f.segments
//                   .map((s) => `${s.origin} → ${s.destination} (${s.date})`)
//                   .join(", ")}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import { API_BASE_URL } from "../config";
import "./ManualFlightForm.css";

export default function ManualFlightForm() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [passengers, setPassengers] = useState(1);
  const [tripClass, setTripClass] = useState("Y");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlights([]);
    setSearchStatus("");

    if (!origin || !destination || !departure) {
      setError("Origin, destination, and departure date are required.");
      return;
    }

    setLoading(true);
    setSearchStatus("Searching for flights...");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/aviasales/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          origin,
          destination,
          departure,
          returnDate,
          passengers: {
            adults: passengers,
            children: 0,
            infants: 0,
          },
          tripClass,
          // Removed 'currency' from the body
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Flight search failed");
      }

      if (data.data && data.data.length > 0) {
        setFlights(data.data);
        setSearchStatus("");
      } else {
        setSearchStatus("No flights found for these dates.");
      }
    } catch (err) {
      console.error("Flight search error:", err);
      setError(err.message);
      setSearchStatus("");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="manual-flight-form">
      <h2>Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Origin (NYC)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            maxLength={3}
          />
          <input
            type="text"
            placeholder="Destination (LAX)"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
        <div className="form-row">
          <input
            type="date"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departure}
          />
        </div>
        <div className="form-row">
          <select
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <select
            value={tripClass}
            onChange={(e) => setTripClass(e.target.value)}
          >
            <option value="Y">Economy</option>
            <option value="C">Business</option>
            <option value="F">First</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      {searchStatus && <div>{searchStatus}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {flights.length > 0 && (
        <div className="flights-list">
          {flights.map((f, i) => (
            <div key={i} className="flight-card">
              <div>
                {f.airline || "Multiple Airlines"} - {f.price}{" "}
                {/* Assuming USD by default based on API documentation */}
                USD
              </div>
              <div>
                {f.segments
                  .map((s) => `${s.origin} → ${s.destination} (${s.date})`)
                  .join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
