import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Check if the response is OK (status 200-299)
      if (res.ok) {
        const data = await res.json();
        setMessage(
          data.message ||
            "If this email is registered, you will receive a password reset link shortly."
        );
      } else {
        // Handle HTTP error statuses
        const data = await res.json();
        setError(
          data.error || "Failed to process your request. Please try again."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-visual">
          <div className="forgot-password-hero">
            <div className="logo">
              <span className="logo-icon">🐨</span>
              <h1>KoalaRoute AI</h1>
            </div>
            <h2>Reset Your Password</h2>
            <p>We'll help you get back to your travel planning</p>
            <div className="illustration">
              <div className="travel-icons">
                <span className="icon-key">🔑</span>
                <span className="icon-mail">✉️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forgot-password-form-container">
          <div className="form-header">
            <h2>Forgot Password</h2>
            <p>Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {message}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`reset-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <div className="back-to-login">
            <p>
              Remember your password? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
