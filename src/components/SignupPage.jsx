// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { API_BASE_URL } from "../config";
// import "./SignupPage.css";

// export default function SignupPage() {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();

//       if (res.ok) {
//         setStep(2);
//       } else {
//         setError(data.msg || "Failed to send OTP");
//       }
//     } catch (err) {
//       setError("Server error. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/signup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp, password }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         navigate("/login", {
//           state: { message: "✅ Account created successfully! Please login." },
//         });
//       } else {
//         setError(data.msg || "Signup failed. Please try again.");
//       }
//     } catch (err) {
//       setError("Server error. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <div className="signup-content">
//         <div className="signup-visual">
//           <div className="signup-hero">
//             <div className="logo">
//               <span className="logo-icon">🐨</span>
//               <h1>KoalaRoute AI</h1>
//             </div>
//             <h2>Join our community!</h2>
//             <p>Create an account to start your travel planning journey</p>
//             <div className="illustration">
//               <div className="travel-icons">
//                 <span className="icon-plane">✈️</span>
//                 <span className="icon-hotel">🏨</span>
//                 <span className="icon-map">🗺️</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="signup-form-container">
//           <div className="form-header">
//             <h2>Create Your Account</h2>
//             <p>Join us to get started with our services</p>

//             {/* Progress Indicator */}
//             <div className="signup-progress">
//               <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
//                 <span>1</span>
//                 <p>Email</p>
//               </div>
//               <div className="progress-line"></div>
//               <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
//                 <span>2</span>
//                 <p>Verification</p>
//               </div>
//             </div>
//           </div>

//           {step === 1 ? (
//             <form
//               onSubmit={handleSendOtp}
//               className="signup-form"
//               autoComplete="on"
//             >
//               {error && <div className="error-message">{error}</div>}

//               <div className="input-group">
//                 <label htmlFor="email">Email Address</label>
//                 <input
//                   id="email"
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   autoComplete="username"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className={`signup-button ${isLoading ? "loading" : ""}`}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Sending OTP...
//                   </>
//                 ) : (
//                   "Continue to Verification"
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form
//               onSubmit={handleSignup}
//               className="signup-form"
//               autoComplete="on"
//             >
//               {error && <div className="error-message">{error}</div>}

//               <div className="input-group">
//                 <label htmlFor="otp">Verification Code</label>
//                 <input
//                   id="otp"
//                   type="text"
//                   name="otp"
//                   placeholder="Enter the code sent to your email"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   required
//                 />
//                 <p className="otp-note">
//                   Check your inbox for the verification code
//                 </p>
//               </div>

//               <div className="input-group">
//                 <label htmlFor="password">Password</label>
//                 <input
//                   id="password"
//                   type="password"
//                   name="password"
//                   placeholder="Create a secure password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="new-password"
//                   required
//                 />
//               </div>

//               <div className="input-group">
//                 <label htmlFor="confirmPassword">Confirm Password</label>
//                 <input
//                   id="confirmPassword"
//                   type="password"
//                   name="confirmPassword"
//                   placeholder="Re-enter your password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   autoComplete="new-password"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className={`signup-button ${isLoading ? "loading" : ""}`}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Creating Account...
//                   </>
//                 ) : (
//                   "Create Account"
//                 )}
//               </button>
//             </form>
//           )}

//           <div className="login-link">
//             <p>
//               Already have an account? <Link to="/login">Sign in here</Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./SignupPage.css";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) strength += 1;
    else feedback.push("at least 8 characters");

    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push("a lowercase letter");

    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push("an uppercase letter");

    // Number check
    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push("a number");

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push("a special character");

    return { strength, feedback };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const isPasswordStrong = passwordStrength.strength >= 4; // Require at least 4/5 criteria

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong) {
      setError("Please create a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();
      if (res.ok) {
        navigate("/login", {
          state: { message: "✅ Account created successfully! Please login." },
        });
      } else {
        setError(data.msg || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-visual">
          <div className="signup-hero">
            <div className="logo">
              <span className="logo-icon">🐨</span>
              <h1>KoalaRoute AI</h1>
            </div>
            <h2>Join our community!</h2>
            <p>Create an account to start your travel planning journey</p>
            <div className="illustration">
              <div className="travel-icons">
                <span className="icon-plane">✈️</span>
                <span className="icon-hotel">🏨</span>
                <span className="icon-map">🗺️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-form-container">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Join us to get started with our services</p>

            {/* Progress Indicator */}
            <div className="signup-progress">
              <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
                <span>1</span>
                <p>Email</p>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
                <span>2</span>
                <p>Verification</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form
              onSubmit={handleSendOtp}
              className="signup-form"
              autoComplete="on"
            >
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <button
                type="submit"
                className={`signup-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  "Continue to Verification"
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleSignup}
              className="signup-form"
              autoComplete="on"
            >
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  placeholder="Enter the code sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="otp-note">
                  Check your inbox for the verification code
                </p>
              </div>

              <div className="input-group password-input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div
                        className={`strength-bar ${
                          passwordStrength.strength > 0 ? "active" : ""
                        } ${passwordStrength.strength > 2 ? "medium" : ""} ${
                          passwordStrength.strength > 3 ? "strong" : ""
                        }`}
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="strength-feedback">
                      {passwordStrength.strength < 4 ? (
                        <span className="strength-text weak">
                          Weak password - needs {passwordStrength.feedback[0]}
                        </span>
                      ) : passwordStrength.strength === 4 ? (
                        <span className="strength-text medium">
                          Medium strength password
                        </span>
                      ) : (
                        <span className="strength-text strong">
                          Strong password! ✓
                        </span>
                      )}
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="password-requirements">
                      <p className="requirements-title">
                        Password must include:
                      </p>
                      <ul>
                        <li className={password.length >= 8 ? "met" : ""}>
                          At least 8 characters
                        </li>
                        <li className={/[a-z]/.test(password) ? "met" : ""}>
                          One lowercase letter
                        </li>
                        <li className={/[A-Z]/.test(password) ? "met" : ""}>
                          One uppercase letter
                        </li>
                        <li className={/[0-9]/.test(password) ? "met" : ""}>
                          One number
                        </li>
                        <li
                          className={/[^A-Za-z0-9]/.test(password) ? "met" : ""}
                        >
                          One special character
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group password-input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="password-mismatch">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="password-match">Passwords match ✓</p>
                )}
              </div>

              <button
                type="submit"
                className={`signup-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading || (password && !isPasswordStrong)}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="login-link">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
