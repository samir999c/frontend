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

import FlightResultsPage from "./components/FlightResultsPage";
import PassengerFormPage from "./components/PassengerFormPage";
import BookingConfirmationPage from "./components/BookingConfirmationPage";

// --- NEW IMPORT ---
import FlightDetailsPage from "./components/FlightDetailsPage"; 
// ------------------

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* --- Your Existing Routes --- */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* ... other routes ... */}
        <Route path="/koalaroute" element={<KoalaRoute />} />
        
        {/* --- UPDATED AMADEUS FLOW --- */}
        <Route path="/flights/results" element={<FlightResultsPage />} />
        <Route path="/flights/details" element={<FlightDetailsPage />} /> {/* <-- NEW ROUTE */}
        <Route path="/flights/passengers" element={<PassengerFormPage />} />
        <Route path="/flights/confirm/:orderId" element={<BookingConfirmationPage />} />
        {/* --------------------------- */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}