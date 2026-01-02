import React, { useState, useEffect } from "react";
import CustomRadio from "../../components/custom-radio";

const InfluencerDashboard = () => {
  // --- 1. State Variables ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showSponsored, setShowSponsored] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- 2. Dummy Data ---
  const [influencers] = useState([
    {
      id: 1,
      name: "Rose Nylund",
      username: "rosenylundisaqueen",
      avgLikes: "15.33",
      followers: "393",
      engagement: "3.48%",
      color: "#007bff",
    },
    {
      id: 2,
      name: "DNA for Insta",
      username: "dnaforinsta",
      avgLikes: "120.5",
      followers: "1.2k",
      engagement: "5.21%",
      color: "#a21caf",
    },
    {
      id: 3,
      name: "Golden Girls Fan",
      username: "st_olaf_vibes",
      avgLikes: "45.12",
      followers: "850",
      engagement: "2.10%",
      color: "#10b981",
    },
  ]);

  // --- 3. Responsive & View Logic ---
  useEffect(() => {
    const handleResize = () => {
      const mobileStatus = window.innerWidth < 768;
      setIsMobile(mobileStatus);

      // On Desktop: If nothing is selected, select the first one automatically
      if (!mobileStatus && !selectedInfluencer && influencers.length > 0) {
        setSelectedInfluencer(influencers[0]);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run on mount

    return () => window.removeEventListener("resize", handleResize);
  }, [influencers, selectedInfluencer]);

  const handleSelect = (inf) => setSelectedInfluencer(inf);

  // This is the fix: setting to null hides profile and shows list on mobile
  const goBack = (e) => {
    e.preventDefault();
    setSelectedInfluencer(null);
  };

  // Create a state to track which radio is selected
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    console.log("API Call with filter:", value);
    // apiCall(value);
  };

  return (
    <div className="container-fluid bg-white">
      <div className="row m-lg-4 justify-content-center proposal-influencers-list-p">
        {/* --- LEFT SIDE: Search and List --- */}
        <div
          className={`col-12 col-md-4 border-right p-0 ${
            selectedInfluencer && isMobile ? "d-none" : "d-block"
          }`}
        >
          <div className="p-3">
            <h4 className="font-weight-bold mb-4" style={{ fontSize: "24px" }}>
              Influencers
            </h4>

            <div className="d-flex align-items-center mb-4">
              <div
                className="input-group bg-light rounded-pill px-3 py-2 align-items-center flex-grow-1"
                style={{ border: "1px solid #f0f0f0" }}
              >
                <i className="bi bi-search text-muted me-2"></i>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  placeholder="Search here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="btn-group">
                <i
                  className="bi bi-sliders text-dark ms-3 cursor-pointer"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "20px" }}
                ></i>
                <ul
                  className="dropdown-menu dropdown-menu-lg-end"
                  aria-labelledby="dropdownMenuButton"
                >
                  <li>
                    <div className="dropdown-item">
                      <CustomRadio
                        name="status"
                        value="all"
                        selectedValue={activeFilter}
                        onChange={handleFilterChange}
                      >
                        All
                      </CustomRadio>
                    </div>
                  </li>

                  <li>
                    <div className="dropdown-item">
                      <CustomRadio
                        name="status"
                        value="review"
                        selectedValue={activeFilter}
                        onChange={handleFilterChange}
                      >
                        Need to review
                      </CustomRadio>
                    </div>
                  </li>

                  <li>
                    <div className="dropdown-item">
                      <CustomRadio
                        name="status"
                        value="active"
                        selectedValue={activeFilter}
                        onChange={handleFilterChange}
                      >
                        Currently working with
                      </CustomRadio>
                    </div>
                  </li>

                  <li>
                    <div className="dropdown-item">
                      <CustomRadio
                        name="status"
                        value="declined"
                        selectedValue={activeFilter}
                        onChange={handleFilterChange}
                      >
                        Declined
                      </CustomRadio>
                    </div>
                  </li>

                  <li>
                    <div className="dropdown-item">
                      <CustomRadio
                        name="status"
                        value="worked-with"
                        selectedValue={activeFilter}
                        onChange={handleFilterChange}
                      >
                        Worked with
                      </CustomRadio>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="influencer-list">
              {influencers
                .filter((inf) =>
                  inf.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((inf) => (
                  <div
                    key={inf.id}
                    onClick={() => handleSelect(inf)}
                    className={`d-flex align-items-center justify-content-between p-3 border-bottom cursor-pointer ${
                      selectedInfluencer?.id === inf.id ? "bg-light" : ""
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3 text-white d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: inf.color,
                          fontSize: "18px",
                        }}
                      >
                        {inf.name.charAt(0)}
                      </div>
                      <div style={{ lineHeight: 1 }}>
                        <div
                          className="font-weight-bold mb-0 text-dark"
                          style={{ fontSize: "15px" }}
                        >
                          {inf.name}
                        </div>
                        <small
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          @{inf.username}
                        </small>
                      </div>
                    </div>
                    <i
                      className="bi bi-chevron-right text-muted"
                      style={{ fontSize: "12px" }}
                    ></i>
                  </div>
                ))}

              <button
                className="btn btn-outline-secondary btn-block mt-4 rounded-lg py-2 text-muted font-weight-normal shadow-sm"
                style={{ borderColor: "#ddd" }}
              >
                Load More
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Profile Detail --- */}
        {/* Visibility logic: Hidden on mobile if NO influencer is selected */}
        <div
          className={`col-12 col-md-8 p-0 ${
            !selectedInfluencer && isMobile ? "d-none" : "d-block"
          }`}
        >
          {selectedInfluencer ? (
            <div className="p-4 text-center">
              {/* Back Button (Mobile Only) */}
              <div className="d-md-none text-left mb-4">
                <button
                  className="btn btn-link text-dark p-0 text-decoration-none font-weight-bold"
                  onClick={goBack}
                  type="button"
                >
                  <i className="bi bi-arrow-left mr-2"></i> Back to list
                </button>
              </div>

              {/* Profile Header */}
              <div
                className="avatar-large mx-auto text-white rounded-circle d-flex align-items-center justify-content-center mb-3 mt-4"
                style={{
                  width: "90px",
                  height: "90px",
                  backgroundColor: selectedInfluencer.color,
                  fontSize: "36px",
                }}
              >
                {selectedInfluencer.name.charAt(0)}
              </div>
              <h3
                className="font-weight-bold mb-1"
                style={{ letterSpacing: "-0.5px" }}
              >
                {selectedInfluencer.name}
              </h3>
              <p className="text-muted mb-5">@{selectedInfluencer.username}</p>

              <hr className="w-100 mb-0" style={{ opacity: "0.1" }} />

              {/* Stats Grid */}
              <div
                className="row no-gutters py-4 border-bottom"
                style={{ borderColor: "#f8f8f8" }}
              >
                <div className="col-4 border-right">
                  <h4 className="font-weight-bold mb-1">
                    {selectedInfluencer.avgLikes}
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Avg. likes per post
                  </small>
                </div>
                <div className="col-4 border-right">
                  <h4 className="font-weight-bold mb-1">
                    {selectedInfluencer.followers}
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Follower count
                  </small>
                </div>
                <div className="col-4">
                  <h4 className="font-weight-bold mb-1">
                    {selectedInfluencer.engagement}
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Engagement Rate
                  </small>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="py-4 d-flex justify-content-center">
                <div className="custom-control custom-switch d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="sponsoredSwitch"
                    checked={showSponsored}
                    onChange={() => setShowSponsored(!showSponsored)}
                  />
                  <label
                    className="custom-control-label text-muted"
                    htmlFor="sponsoredSwitch"
                    style={{
                      fontSize: "14px",
                      paddingLeft: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Show sponsored post
                  </label>
                </div>
              </div>

              <div className="mt-5 pt-5">
                <p
                  className="text-muted font-weight-light"
                  style={{ fontSize: "14px", opacity: "0.6" }}
                >
                  This Influencer has no recent posts.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-100 d-none d-md-flex align-items-center justify-content-center text-muted">
              <p>Select an influencer to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
