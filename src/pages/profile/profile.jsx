// src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import PageHeader from "../../components/page-header";
import useAxios from "../../hooks/use-axios";
import "./profile.scss";
import AuthContext from "../../context/auth-provider";
import useBodyClass from "../../hooks/use-body-class";

export default function Profile() {
  const { auth, setAuth } = useContext(AuthContext);
  const axios = useAxios();
  useBodyClass("profile-p");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({
    error: "",
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!auth?.user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/users/${auth.user.id}`);
        const user = res.data.data;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          password: "",
          confirm_password: "",
        });
      } catch (err) {
        setErrors({ error: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth?.user?.id, axios]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Live password match only after first submit
    if (
      hasSubmitted &&
      (field === "password" || field === "confirm_password")
    ) {
      const pwd = field === "password" ? value : formData.password;
      const confirm =
        field === "confirm_password" ? value : formData.confirm_password;

      if (pwd && confirm && pwd !== confirm) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirm_password: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    setSuccess("");
    setUpdating(true);

    const newErrors = {};

    // Validate
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setUpdating(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);

    try {
      await axios.put("/users/" + auth?.user?.id, data);
      setSuccess("Profile updated successfully!");
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          id: formData.id ?? prev.user.id, // update id if provided, otherwise keep old
          name: formData.name ?? prev.user.name,
          email: formData.email ?? prev.user.email,
        },
      }));
      // Reset password fields and all errors
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirm_password: "",
      }));
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed.";
      setErrors({ error: msg });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Profile"
          breadcrumb={[{ text: "Profile", active: true }]}
        />
        <div className="app-content">
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Profile"
        breadcrumb={[{ text: "Profile", active発行: true }]}
      />
      <div className="app-content">
        <div className="wrapper bg-white mt-sm-5">
          <h4 className="pb-4 border-bottom">Account settings</h4>

          {success && <div className="alert alert-success mb-3">{success}</div>}
          {errors?.error && <div className="alert alert-danger mb-3">{errors.error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="py-2">
              {/* Full Name */}
              <div className="row py-2">
                <div className="col">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className={`bg-light form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="row py-2">
                <div className="col">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className={`bg-light form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="row py-2">
                <div className="col pt-md-0 pt-3">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    className={`bg-light form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                  />
                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="row py-2">
                <div className="col pt-md-0 pt-3">
                  <label htmlFor="confirm_password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    className={`bg-light form-control ${
                      errors.confirm_password ? "is-invalid" : ""
                    }`}
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleFieldChange("confirm_password", e.target.value)
                    }
                  />
                  {errors.confirm_password && (
                    <div className="invalid-feedback d-block">
                      {errors.confirm_password}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="py-3 pb-4">
                <button
                  type="submit"
                  className="btn btn-primary me-3"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  className="btn border button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      password: "",
                      confirm_password: "",
                    }));
                    setErrors({});
                    setSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
