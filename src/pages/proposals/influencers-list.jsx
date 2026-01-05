import React, { useState, useEffect, useCallback } from "react";
import CustomRadio from "../../components/custom-radio";
import useAxios from "../../hooks/use-axios";

const InfluencersList = () => {
  const axios = useAxios();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showSponsored, setShowSponsored] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [influencers, setInfluencers] = useState([]);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchInfluencers = useCallback(
    async (isNewFilter = false) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const currentPage = isNewFilter ? 1 : page;
        const response = await axios({
          method: "GET",
          url: "/influencers",
          params: {
            page: currentPage,
            pagesize: 10,
            status: activeFilter === "all" ? "" : activeFilter,
          },
        });

        const pagination = response.data?.data?.pagination;

        const igbAccounts = response.data?.data?.igb_accounts || [];

        if (isNewFilter) {
          setInfluencers(igbAccounts);
          setPage(2);
        } else {
          setInfluencers((prev) => [...prev, ...igbAccounts]);
          setPage((prev) => prev + 1);
        }

        if (pagination) {
          setHasMore(pagination.page < pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch influencers:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [axios, page, activeFilter, isLoading]
  );

  useEffect(() => {
    fetchInfluencers(true);
  }, [activeFilter]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Helper Functions ---
  const handleSelect = (inf) => setSelectedInfluencer(inf);

  const goBack = (e) => {
    e.preventDefault();
    setSelectedInfluencer(null);
  };

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    setHasMore(true); // Reset load more for new filter
  };

  const formatNumber = (num, digits = 1) => {
    const n = Number(num);
    if (!n || isNaN(n)) return "0";

    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "m" },
      { value: 1e9, symbol: "b" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find((item) => n >= item.value);
    return item
      ? (n / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
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

            {/* Search & Filter UI */}
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
                  data-bs-toggle="dropdown"
                  style={{ fontSize: "20px" }}
                ></i>
                <ul className="dropdown-menu dropdown-menu-lg-end">
                  {["all", "review", "active", "declined", "worked-with"].map(
                    (f) => (
                      <li key={f}>
                        <div className="dropdown-item">
                          <CustomRadio
                            name="status"
                            value={f}
                            selectedValue={activeFilter}
                            onChange={handleFilterChange}
                          >
                            {f.replace("-", " ").toUpperCase()}
                          </CustomRadio>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Influencer List Items */}
            <div className="influencer-list">
              {influencers
                .filter((inf) =>
                  (inf?.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
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
                        className="me-3 text-white d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: inf.color || "#ccc",
                        }}
                      >
                        {inf.profile_picture_url ? (
                          <img
                            src={inf.profile_picture_url}
                            alt={inf.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        ) : (
                          inf.name?.charAt(0)
                        )}
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

              {/* Load More Button Logic */}
              {hasMore && (
                <button
                  onClick={() => fetchInfluencers(false)}
                  disabled={isLoading}
                  className="btn btn-outline-secondary btn-block mt-4 rounded-lg py-2 text-muted font-weight-normal shadow-sm w-100"
                  style={{ borderColor: "#ddd" }}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    "Load More"
                  )}
                </button>
              )}

              {!hasMore && influencers.length > 0 && (
                <p
                  className="text-center text-muted mt-4"
                  style={{ fontSize: "12px" }}
                >
                  No more influencers to show.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Profile Detail --- */}
        <div
          className={`col-12 col-md-8 p-0 ${
            !selectedInfluencer && isMobile ? "d-none" : "d-block"
          }`}
        >
          {selectedInfluencer ? (
            <div className="p-4 text-center">
              <div className="d-md-none text-left mb-4">
                <button
                  className="btn btn-link text-dark p-0 text-decoration-none font-weight-bold"
                  onClick={goBack}
                >
                  <i className="bi bi-arrow-left mr-2"></i> Back to list
                </button>
              </div>

              <div
                className="avatar-large mx-auto text-white rounded-circle d-flex align-items-center justify-content-center mb-3 mt-4 overflow-hidden"
                style={{
                  width: "90px",
                  height: "90px",
                  backgroundColor: selectedInfluencer.color || "#ccc",
                  fontSize: "36px",
                }}
              >
                {selectedInfluencer.profile_picture_url ? (
                  <img
                    src={selectedInfluencer.profile_picture_url}
                    alt={selectedInfluencer.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  selectedInfluencer.name?.charAt(0)
                )}
              </div>
              <h3 className="font-weight-bold mb-1">
                {selectedInfluencer.name}
              </h3>
              <p className="text-muted mb-5">@{selectedInfluencer.username}</p>

              <hr className="w-100 mb-0" style={{ opacity: "0.1" }} />

              {/* Stats Grid with Safety Guards */}
              <div
                className="row no-gutters py-4 border-bottom"
                style={{ borderColor: "#f8f8f8" }}
              >
                <div className="col-4 border-right">
                  <h4 className="font-weight-bold mb-1">
                    {formatNumber(
                      selectedInfluencer.profile_average_insights?.likes
                    )}
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Avg. likes
                  </small>
                </div>
                <div className="col-4 border-right">
                  <h4 className="font-weight-bold mb-1">
                    {formatNumber(
                      selectedInfluencer.profile_average_insights
                        ?.followers_count
                    )}
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Followers
                  </small>
                </div>
                <div className="col-4">
                  <h4 className="font-weight-bold mb-1">
                    {Number(
                      selectedInfluencer?.profile_average_insights
                        ?.engagement || 0
                    ).toFixed(2)}
                    %
                  </h4>
                  <small
                    className="text-muted d-block font-weight-bold"
                    style={{ fontSize: "10px", textTransform: "uppercase" }}
                  >
                    Engagement
                  </small>
                </div>
              </div>

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
                    className="custom-control-label text-muted ms-2"
                    htmlFor="sponsoredSwitch"
                    style={{ fontSize: "14px", cursor: "pointer" }}
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

export default InfluencersList;
