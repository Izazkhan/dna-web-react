import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    isAuthenticated: false,
    user: null,
    isReady: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser && !auth?.accessToken) {
      let parsedUser = null;

      try {
        // Safely parse JSON
        parsedUser = JSON.parse(storedUser);

        // Guard against invalid parsed values (e.g. [object Object] stringified)
        if (typeof parsedUser === "string") {
          throw new Error("Invalid user data format");
        }
      } catch (error) {
        console.warn(
          "Corrupted or invalid user data in localStorage. Clearing.",
          error
        );
        localStorage.removeItem("user");
      }

      setAuth({
        accessToken: storedToken,
        isAuthenticated: true,
        user: parsedUser, // will be null if parsing failed
        isReady: true,
      });
    }
    setAuth((prev) => ({ ...prev, isReady: true }));
  }, []);

  // Save to localStorage whenever auth changes
  useEffect(() => {
    if (auth?.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (auth?.user !== undefined) {
      try {
        if (auth.user && typeof auth.user === "object") {
          localStorage.setItem("user", JSON.stringify(auth.user));
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, [auth]);

  if (!auth?.isReady) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading app...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
