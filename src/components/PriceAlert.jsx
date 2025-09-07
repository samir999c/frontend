// import React, { useState, useEffect } from "react";
// import { BASE_URL } from "../config";
// import "./PriceAlert.css";

// export default function PriceAlert() {
//   const [alerts, setAlerts] = useState([]);
//   const [flight, setFlight] = useState("");
//   const [targetPrice, setTargetPrice] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchAlerts = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${BASE_URL}/koalaroute/alerts`, {
//         headers: {
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//       });
//       const data = await res.json();
//       setAlerts(data.alerts || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchAlerts();
//   }, []);

//   const handleAddAlert = async (e) => {
//     e.preventDefault();
//     if (!flight || !targetPrice) return;

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${BASE_URL}/koalaroute/alerts`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({ flight, targetPrice }),
//       });

//       if (res.ok) {
//         setFlight("");
//         setTargetPrice("");
//         fetchAlerts();
//       } else {
//         alert("Failed to add alert");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error connecting to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="alert-container">
//       <h3>Price Alerts</h3>

//       <form onSubmit={handleAddAlert} className="alert-form">
//         <input
//           type="text"
//           placeholder="Flight Name"
//           value={flight}
//           onChange={(e) => setFlight(e.target.value)}
//           required
//         />
//         <input
//           type="number"
//           placeholder="Target Price"
//           value={targetPrice}
//           onChange={(e) => setTargetPrice(e.target.value)}
//           required
//         />
//         <button type="submit">{loading ? "Adding..." : "Add Alert"}</button>
//       </form>

//       {alerts.length > 0 ? (
//         <div className="alert-list">
//           {alerts.map((a, idx) => (
//             <div key={idx} className="alert-card">
//               <p>{a.flight}</p>
//               <p>Target: ${a.targetPrice}</p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No alerts yet.</p>
//       )}
//     </div>
//   );
// }

// dummy data

import React, { useState, useEffect } from "react";
import "./PriceAlert.css";

export default function ModernPriceAlert() {
  const [alerts, setAlerts] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("alerts");

  const currencies = {
    usd: { symbol: "$", name: "USD" },
    eur: { symbol: "€", name: "EUR" },
    gbp: { symbol: "£", name: "GBP" },
    jpy: { symbol: "¥", name: "JPY" },
  };

  // Dummy alerts for initial display
  useEffect(() => {
    const dummyAlerts = [
      {
        id: 1,
        origin: "NYC",
        destination: "LON",
        airline: "Delta Airlines",
        targetPrice: 550,
        currentPrice: 620,
        currency: "usd",
        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        id: 2,
        origin: "KTM",
        destination: "DOH",
        airline: "Qatar Airways",
        targetPrice: 420,
        currentPrice: 380,
        currency: "usd",
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "triggered",
      },
      {
        id: 3,
        origin: "LAX",
        destination: "PAR",
        airline: "Air France",
        targetPrice: 700,
        currentPrice: 750,
        currency: "usd",
        created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    ];
    setAlerts(dummyAlerts);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!origin || !destination || !targetPrice) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    setLoading(true);

    // Simulate server delay
    setTimeout(() => {
      const newAlert = {
        id: Date.now(),
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        targetPrice: parseInt(targetPrice),
        currentPrice:
          Math.floor(Math.random() * 200) + parseInt(targetPrice) + 100,
        currency,
        created: new Date(),
        status: "active",
        airline: [
          "Delta Airlines",
          "Qatar Airways",
          "Emirates",
          "British Airways",
        ][Math.floor(Math.random() * 4)],
      };

      setAlerts((prev) => [newAlert, ...prev]);
      setOrigin("");
      setDestination("");
      setTargetPrice("");
      setLoading(false);

      showNotification("Price alert created successfully!");
    }, 800);
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
    showNotification("Alert deleted");
  };

  const handleToggleAlert = (id) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: alert.status === "active" ? "paused" : "active",
            }
          : alert
      )
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriceDifference = (target, current) => {
    const difference = current - target;
    const percentage = ((difference / target) * 100).toFixed(1);
    return { difference, percentage };
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "alerts")
      return alert.status === "active" || alert.status === "paused";
    if (activeTab === "triggered") return alert.status === "triggered";
    return true;
  });

  return (
    <div className="modern-price-alert">
      <div className="alert-container">
        <div className="alert-header">
          <h2>Price Alerts</h2>
          <p>Get notified when flight prices drop</p>
        </div>

        <div className="alert-tabs">
          <button
            className={activeTab === "alerts" ? "active" : ""}
            onClick={() => setActiveTab("alerts")}
          >
            Active Alerts
            <span className="tab-count">
              {
                alerts.filter(
                  (a) => a.status === "active" || a.status === "paused"
                ).length
              }
            </span>
          </button>
          <button
            className={activeTab === "triggered" ? "active" : ""}
            onClick={() => setActiveTab("triggered")}
          >
            Triggered
            <span className="tab-count">
              {alerts.filter((a) => a.status === "triggered").length}
            </span>
          </button>
        </div>

        <form onSubmit={handleAddAlert} className="alert-form">
          <div className="form-row">
            <div className="input-group">
              <label>From</label>
              <input
                type="text"
                placeholder="Origin (e.g., NYC)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                maxLength={3}
                required
              />
            </div>

            <div className="input-group">
              <label>To</label>
              <input
                type="text"
                placeholder="Destination (e.g., LON)"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Target Price</label>
              <div className="price-input-container">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="currency-select"
                >
                  {Object.entries(currencies).map(([key, { symbol, name }]) => (
                    <option key={key} value={key}>
                      {symbol} {name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="0.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <button type="submit" className="add-alert-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  <span className="plus-icon">+</span>
                  Add Alert
                </>
              )}
            </button>
          </div>
        </form>

        {filteredAlerts.length > 0 ? (
          <div className="alert-list">
            {filteredAlerts.map((alert) => {
              const { difference, percentage } = getPriceDifference(
                alert.targetPrice,
                alert.currentPrice
              );
              const isTriggered = alert.status === "triggered";
              const isActive = alert.status === "active";

              return (
                <div key={alert.id} className={`alert-card ${alert.status}`}>
                  <div className="alert-card-header">
                    <div className="route">
                      <span className="origin">{alert.origin}</span>
                      <span className="arrow">→</span>
                      <span className="destination">{alert.destination}</span>
                    </div>
                    <div className="alert-actions">
                      <button
                        className="toggle-btn"
                        onClick={() => handleToggleAlert(alert.id)}
                        title={isActive ? "Pause alert" : "Activate alert"}
                      >
                        {isActive ? "⏸️" : "▶️"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteAlert(alert.id)}
                        title="Delete alert"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="airline">{alert.airline}</div>

                  <div className="price-comparison">
                    <div className="price-target">
                      <span className="label">Target:</span>
                      <span className="value">
                        {currencies[alert.currency].symbol}
                        {alert.targetPrice}
                      </span>
                    </div>

                    <div className="price-current">
                      <span className="label">Current:</span>
                      <span
                        className={`value ${isTriggered ? "triggered" : ""}`}
                      >
                        {currencies[alert.currency].symbol}
                        {alert.currentPrice}
                      </span>
                    </div>

                    <div className="price-difference">
                      <span
                        className={`difference ${
                          difference <= 0 ? "positive" : "negative"
                        }`}
                      >
                        {difference <= 0 ? "↓" : "↑"}
                        {currencies[alert.currency].symbol}
                        {Math.abs(difference)}
                      </span>
                      <span
                        className={`percentage ${
                          difference <= 0 ? "positive" : "negative"
                        }`}
                      >
                        ({difference <= 0 ? "" : "+"}
                        {percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="alert-footer">
                    <span className="created-date">
                      Created: {formatDate(alert.created)}
                    </span>
                    <span className={`status-badge ${alert.status}`}>
                      {alert.status === "triggered"
                        ? "Price dropped! 🎉"
                        : alert.status === "active"
                        ? "Monitoring"
                        : "Paused"}
                    </span>
                  </div>

                  {isTriggered && (
                    <div className="triggered-notice">
                      <span>🔥 Price alert triggered! Time to book!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>
              No {activeTab === "triggered" ? "triggered" : "active"} alerts
            </h3>
            <p>
              {activeTab === "triggered"
                ? "When your price alerts are triggered, they'll appear here."
                : "Create a price alert to get notified when flight prices drop."}
            </p>
          </div>
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
