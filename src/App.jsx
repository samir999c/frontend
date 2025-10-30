// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
// ... (existing imports)
import KoalaRoute from "./components/KoalaRoute"; 

// --- NEW IMPORTS for Amadeus Booking Flow ---
import FlightResultsPage from "./components/FlightResultsPage";
import PassengerFormPage from "./components/PassengerFormPage";
import BookingConfirmationPage from "./components/BookingConfirmationPage";
// ---------------------------------------------

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ... (existing routes) ... */}
        <Route path="/koalaroute" element={<KoalaRoute />} /> 
        
        {/* --- NEW AMADEUS BOOKING FLOW ROUTES --- */}
        <Route path="/flights/results" element={<FlightResultsPage />} />
        <Route path="/flights/passengers" element={<PassengerFormPage />} />
        <Route path="/flights/confirm/:orderId" element={<BookingConfirmationPage />} />
        {/* -------------------------------------- */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}