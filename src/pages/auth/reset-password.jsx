// src/pages/ResetPassword.jsx
import { useEffect, useState } from "react";
import useBodyClass from "../../hooks/use-body-class";
import useAxios from "../../hooks/use-axios";

export const ResetPassword = () => {
  const axios = useAxios();
  useBodyClass("login-page");

  // Get token from URL: /reset-password?token=abc123
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");

  const [token] = useState(urlToken);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(urlParams.get("email") || "");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate token on load
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new one.");
    }
  }, [token]);

  // Validate password strength
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccess(false);

    // Client-side validation
    if (!token) {
      setError("No token provided.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/password-reset", {
        token,
        password,
        email,
      });

      const data = res.data;

      if (!res.statusText) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="login-box">
        <div className="card">
          <div className="card-body login-card-body text-center">
            <p className="text-danger">{error}</p>
            <a href="/forgot-password" className="btn btn-link">
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-box">
      <div className="card">
        <div className="card-body login-card-body">
          <div className="text-center mb-4">
            <h4 className="mb-0">Reset Password?</h4>
            <p className="text-muted small">
              Your identity has been verified! Set your new password.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success" role="alert">
              Password reset successfully! <a href="/login">Log in now</a>.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <input type="hidden" name="email" value={email} />
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <div className="input-group-text">
                <span className="bi bi-lock-fill"></span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={loading}
                required
              />
              <div className="input-group-text">
                <span className="bi bi-lock-fill"></span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="row">
              <div className="col">
                <div className="d-grid gap-2">
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
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-3 text-center">
            <small className="text-muted">
              Password must be 8+ characters.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
