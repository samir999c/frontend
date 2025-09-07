import React from "react";
import "./TabNavigation.css";

export default function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "chat", label: "AI Assistant", icon: "💬" },
    { key: "flights", label: "Flights", icon: "✈️" },
    { key: "hotels", label: "Hotels", icon: "🏨" },
    { key: "alerts", label: "Price Alerts", icon: "🔔" },
  ];

  return (
    <div className="tab-navigation">
      <div className="tab-scroll-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            <span className="active-indicator"></span>
          </button>
        ))}
      </div>
    </div>
  );
}
