// src/pages/ForgotPassword.jsx
import { useState } from "react";
import useBodyClass from "../../hooks/use-body-class";
import useAxios from "../../hooks/use-axios";

export const ForgotPassword = () => {
  useBodyClass("login-page");

  const axios = useAxios();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    // Basic client-side validation
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });

      const data = res.data;

      if (res.statusText != "OK")
        throw new Error(data.message || "Something went wrong.");

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <div className="card shadow-sm">
        <div className="card-body login-card-body">
          <div className="text-center mb-4">
            <h4 className="mb-0">Forgot Password?</h4>
            <p className="text-muted small">
              Provide your account email in which you can reset your password.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="alert alert-success d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>
                Check your inbox for the reset link.{" "}
                <a href="/login" className="alert-link">
                  Back to login
                </a>
                .
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
              <span className="input-group-text">
                <i className="bi bi-envelope-fill"></i>
              </span>
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1"></i>
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <a href="/login" className="text-muted small">
              <i className="bi bi-arrow-left"></i> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
