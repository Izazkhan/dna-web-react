// src/pages/Register.jsx

import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/use-auth";
import useAxios from "../../hooks/use-axios";
import { useEffect, useState } from "react";
import useBodyClass from "../../hooks/use-body-class";

export default function Register() {
  const axios = useAxios();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useBodyClass("register-page");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      setError("You must agree to the terms");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      login(data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register-box">
      <div className="card">
        <div className="card-body register-card-body">
          <p className="register-box-msg">Register a new membership</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                aria-label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
              <div className="input-group-text">
                <span className="bi bi-person"></span>
              </div>
            </div>

            {/* Email */}
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <div className="input-group-text">
                <span className="bi bi-envelope"></span>
              </div>
            </div>

            {/* Password */}
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="input-group-text">
                <span className="bi bi-lock-fill"></span>
              </div>
            </div>

            {/* Terms + Submit */}
            <div className="row">
              <div className="col">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="agreeTerms"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    I agree to the <a href="/terms">terms</a>
                  </label>
                </div>
              </div>
            </div>

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
                        Registering…
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <p className="mt-3">
            Already Registered?{" "}
            <a href="/login" className="text-center">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
