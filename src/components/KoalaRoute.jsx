import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";
import ManualFlightForm from "./amadeusflightsearch"; // This is the correct import
import ManualHotelForm from "./ManualHotelForm";
import PriceAlert from "./PriceAlert";
import TabNavigation from "./TabNavigation";
import { API_BASE_URL } from "../config";
import "./KoalaRoute.css";

export default function KoalaRoute() {
  const [activeTab, setActiveTab] = useState("chat");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/koalaroute/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          // Token is invalid/expired
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // setError("Failed to load dashboard data");
        // Don't automatically logout on network errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="koalaroute-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="welcome-section">
            <div className="user-badge">
              <span className="user-avatar">🐨</span>
              <div className="user-info">
                <h1 className="dashboard-title">Welcome to KoalaRoute AI</h1>
                <p className="user-email">{userEmail}</p>
              </div>
            </div>
            {/* Add logout button */}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {dashboardData && (
            <p className="dashboard-msg">{dashboardData.msg}</p>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="tab-content">
          {activeTab === "chat" && <Chat />}
          {activeTab === "flights" && <ManualFlightForm />}
          {activeTab === "hotels" && <ManualHotelForm />}
          {activeTab === "alerts" && <PriceAlert />}
        </div>
      </div>
    </div>
  );
}