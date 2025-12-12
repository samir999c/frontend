// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout"; 
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import KoalaRoute from "./components/KoalaRoute";

// --- NEW IMPORTS for Amadeus Booking Flow ---
import FlightResultsPage from "./components/FlightResultsPage";
import FlightDetailsPage from "./components/FlightDetailsPage"; 
import PassengerFormPage from "./components/PassengerFormPage";
import BookingConfirmationPage from "./components/BookingConfirmationPage";

// 1. --- ADD THIS IMPORT ---
import SeatMapPage from "./components/SeatMapPage";
// --------------------------

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/koalaroute" element={<KoalaRoute />} />
        
        {/* --- NEW AMADEUS BOOKING FLOW ROUTES --- */}
        <Route path="/flights/results" element={<FlightResultsPage />} />
        <Route path="/flights/details" element={<FlightDetailsPage />} />
        <Route path="/flights/passengers" element={<PassengerFormPage />} />
        
        {/* 2. --- ADD THIS ROUTE --- */}
        <Route path="/flights/seatmap" element={<SeatMapPage />} />
        {/* ------------------------- */}

        <Route path="/flights/confirm/:orderId" element={<BookingConfirmationPage />} />
        {/* -------------------------------------- */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}