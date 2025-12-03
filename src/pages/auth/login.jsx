import { useState } from "react";
import useAxios from "../../hooks/use-axios";
import useAuth from "../../hooks/use-auth";
import useBodyClass from "../../hooks/use-body-class";

const Login = () => {
  const axios = useAxios();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useBodyClass("login-page");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { email, password });
      login(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="login-box">
      <div className="card">
        <div className="card-body login-card-body">
          <p className="login-box-msg">Sign in</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="input-group-text">
                <span className="bi bi-envelope"></span>
              </div>
            </div>

            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="input-group-text">
                <span className="bi bi-lock-fill"></span>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </form>

          <p className="mt-1">
            <a href="/register" className="text-center">
              Register
            </a>
          </p>
          <p className="mt-1">
            <a href="/forgot-password" className="text-center">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
