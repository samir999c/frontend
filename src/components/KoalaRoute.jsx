import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";
import ManualFlightForm from "./ManualFlightForm";
import ManualHotelForm from "./ManualHotelForm";
import PriceAlert from "./PriceAlert";
import TabNavigation from "./TabNavigation";
import { API_BASE_URL } from "../config";
import "./KoalaRoute.css";

export default function KoalaRoute() {
  const [activeTab, setActiveTab] = useState("chat");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setDashboardData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Checking authentication...</p>
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
            {dashboardData && (
              <p className="dashboard-msg">{dashboardData.msg}</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
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
