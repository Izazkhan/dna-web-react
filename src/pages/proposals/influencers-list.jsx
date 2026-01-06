import { useState, useEffect, useCallback } from "react";
import CustomRadio from "../../components/custom-radio";
import useAxios from "../../hooks/use-axios";

const InfluencersList = () => {
  const axios = useAxios();
  const PAGE_SIZE = 1;
  const POSTS_PAGE_SIZE = 9; // Show posts in rows of 3

  // List States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("engagement");

  // Data States
  const [influencers, setInfluencers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [proposalsMap, setProposalsMap] = useState({});

  // Posts specific states
  const [influencerPosts, setInfluencerPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Pagination/Loading States
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getSortParam = (sort) =>
    sort === "followers" ? "followers_count" : "engagement";

  const apiStatus = {
    "worked-with": "completed",
    review: "accepted",
    declined: "rejected",
    active: "active",
  };

  const getApiStatus = (filter) => {
    if (filter === "worked-with") return "completed";
    if (filter === "review") return "accepted";
    return filter;
  };

  // FETCH MAIN LIST
  const fetchData = useCallback(
    async (isInitial = false, overrideSort = null) => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        const currentPage = isInitial ? 1 : page;
        const isAll = activeFilter === "all";
        const statusForUrl = apiStatus[activeFilter];
        const url = isAll
          ? "/influencers"
          : `/adcampaigns/with-${statusForUrl}-proposals`;
        const currentSort = overrideSort || sortBy;

        const response = await axios({
          method: "GET",
          url: url,
          params: {
            page: currentPage,
            pagesize: PAGE_SIZE,
            search: searchQuery,
            sort: getSortParam(currentSort),
          },
        });

        const resData = response.data?.data;
        const items = isAll
          ? resData?.igb_accounts || []
          : resData?.campaigns || [];
        const pagination = response.data?.data?.pagination;

        if (isInitial) {
          isAll ? setInfluencers(items) : setCampaigns(items);
          setPage(2);
        } else {
          isAll
            ? setInfluencers((p) => [...p, ...items])
            : setCampaigns((p) => [...p, ...items]);
          setPage((p) => p + 1);
        }
        setHasMore(
          pagination
            ? pagination.page < pagination.totalPages
            : items.length >= PAGE_SIZE
        );
      } catch (error) {
        console.error("Main list fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [axios, page, activeFilter, isLoading, sortBy, searchQuery]
  );

  // FETCH NESTED PROPOSALS
  const fetchProposals = useCallback(
    async (campaignId, isInitial = false, overrideSort = null) => {
      setProposalsMap((prev) => ({
        ...prev,
        [campaignId]: { ...(prev[campaignId] || {}), isLoading: true },
      }));

      try {
        const currentData = proposalsMap[campaignId];
        const nextPage = isInitial ? 1 : currentData?.page || 1;
        const statusForUrl = getApiStatus(activeFilter);
        const currentSort = overrideSort || sortBy;

        const response = await axios.get(
          `/adcampaigns/${campaignId}/proposals/${statusForUrl}`,
          {
            params: {
              page: nextPage,
              pagesize: PAGE_SIZE,
              sort: getSortParam(currentSort),
            },
          }
        );

        const newProposals = response.data?.data?.proposals || [];
        const pagination = response.data?.data?.pagination;

        setProposalsMap((prev) => ({
          ...prev,
          [campaignId]: {
            list: isInitial
              ? newProposals
              : [...(prev[campaignId]?.list || []), ...newProposals],
            page: (pagination?.page || nextPage) + 1,
            hasMore: pagination
              ? pagination.page < pagination.totalPages
              : false,
            isLoading: false,
          },
        }));
      } catch (err) {
        console.error("Proposals fetch error", err);
        setProposalsMap((prev) => ({
          ...prev,
          [campaignId]: { ...(prev[campaignId] || {}), isLoading: false },
        }));
      }
    },
    [axios, activeFilter, sortBy, proposalsMap]
  );

  // FETCH POSTS WITH PAGINATION
  const fetchInfluencerPosts = useCallback(
    async (isInitial = false) => {
      if (!selectedInfluencer || isPostsLoading) return;

      setIsPostsLoading(true);
      const currentPage = isInitial ? 1 : postsPage;

      try {
        const response = await axios.get(
          `/influencer/${selectedInfluencer.id}/posts`,
          {
            params: { page: currentPage, pagesize: POSTS_PAGE_SIZE },
          }
        );

        const newPosts = response.data?.data?.posts || [];
        const pagination = response.data?.data?.pagination;

        if (isInitial) {
          setInfluencerPosts(newPosts);
          setPostsPage(2);
        } else {
          setInfluencerPosts((prev) => [...prev, ...newPosts]);
          setPostsPage((prev) => prev + 1);
        }

        setHasMorePosts(
          pagination
            ? pagination.page < pagination.totalPages
            : newPosts.length >= POSTS_PAGE_SIZE
        );
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsPostsLoading(false);
      }
    },
    [selectedInfluencer, postsPage, isPostsLoading, axios]
  );

  // Trigger initial posts fetch when influencer changes
  useEffect(() => {
    setInfluencerPosts([]);
    setPostsPage(1);
    setHasMorePosts(false);
    if (selectedInfluencer) {
      fetchInfluencerPosts(true);
    }
  }, [selectedInfluencer]);

  // Debounced Search/Filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setExpandedCampaignId(null);
      setProposalsMap({});
      fetchData(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [activeFilter, searchQuery]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (activeFilter === "all") {
      setInfluencers([]);
      fetchData(true, newSort);
    } else if (expandedCampaignId) {
      setProposalsMap((prev) => ({
        ...prev,
        [expandedCampaignId]: {
          ...prev[expandedCampaignId],
          list: [],
          page: 1,
          hasMore: true,
          isLoading: true,
        },
      }));
      fetchProposals(expandedCampaignId, true, newSort);
    }
  };

  const toggleCampaign = (campaignId) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
    } else {
      setExpandedCampaignId(campaignId);
      if (
        !proposalsMap[campaignId] ||
        proposalsMap[campaignId].list.length === 0
      ) {
        fetchProposals(campaignId, true);
      }
    }
  };

  const formatNumber = (num, digits = 1) => {
    const n = Number(num);
    if (!n || isNaN(n)) return "0";
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "m" },
    ];
    const item = lookup
      .slice()
      .reverse()
      .find((i) => n >= i.value);
    return item
      ? n > 10000
        ? (n / item.value)
            .toFixed(digits)
            .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + item.symbol
        : n
      : "0";
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container-fluid bg-white">
      <div className="row m-lg-4 justify-content-center proposal-influencers-list-p">
        {/* LEFT COLUMN: LIST */}
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
                />
              </div>
              <div className="btn-group">
                <i
                  className="bi bi-sliders text-dark ms-3 cursor-pointer"
                  data-bs-toggle="dropdown"
                  style={{ fontSize: "20px" }}
                ></i>
                <ul className="dropdown-menu dropdown-menu-lg-end shadow border-0">
                  {["all", "review", "active", "declined", "worked-with"].map(
                    (f) => (
                      <li key={f}>
                        <button
                          onClick={() => setActiveFilter(f)}
                          className="dropdown-item py-2"
                        >
                          <CustomRadio
                            name="status"
                            value={f}
                            selectedValue={activeFilter}
                          >
                            {f.replace("-", " ").charAt(0).toUpperCase() +
                              f.replace("-", " ").slice(1)}
                          </CustomRadio>
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="influencer-list">
              {activeFilter === "all"
                ? influencers.map((inf) => (
                    <div
                      key={inf.id}
                      onClick={() => setSelectedInfluencer(inf)}
                      className={`d-flex align-items-center justify-content-between p-2 border-bottom cursor-pointer ${
                        selectedInfluencer?.id === inf.id ? "bg-light" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={inf.profile_picture_url}
                          className="me-3 rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="lh-1">
                          <div
                            className="font-weight-bold"
                            style={{ fontSize: "14px" }}
                          >
                            {inf.name}
                          </div>
                          <small className="text-muted">@{inf.username}</small>
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  ))
                : campaigns.map((camp) => (
                    <div key={camp.id} className="border-bottom">
                      <div
                        onClick={() => toggleCampaign(camp.id)}
                        className="d-flex align-items-center justify-content-between px-1 py-2 cursor-pointer hover-bg-light"
                      >
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          {camp.name}
                        </span>
                        <i
                          className={`bi bi-chevron-${
                            expandedCampaignId === camp.id ? "up" : "down"
                          } text-muted`}
                        ></i>
                      </div>
                      {expandedCampaignId === camp.id && (
                        <div className="bg-white px-3 pb-3">
                          <div className="dropdown mb-3">
                            <small
                              className="text-muted dropdown-toggle cursor-pointer font-weight-bold"
                              data-bs-toggle="dropdown"
                            >
                              Sort:{" "}
                              {sortBy === "engagement"
                                ? "Engagement"
                                : "Followers"}
                            </small>
                            <ul className="dropdown-menu shadow-sm border-0">
                              <li>
                                <button
                                  className="dropdown-item small"
                                  onClick={() => handleSortChange("engagement")}
                                >
                                  Avg Engagement
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item small"
                                  onClick={() => handleSortChange("followers")}
                                >
                                  Followers
                                </button>
                              </li>
                            </ul>
                          </div>
                          {proposalsMap[camp.id]?.list?.map((prop) => (
                            <div
                              key={prop.id}
                              onClick={() =>
                                setSelectedInfluencer(prop.igb_account)
                              }
                              className={`d-flex align-items-center justify-content-between py-2 cursor-pointer border-top ${
                                selectedInfluencer?.id === prop.igb_account?.id
                                  ? "bg-light rounded px-1"
                                  : ""
                              }`}
                            >
                              <div className="d-flex align-items-center">
                                <img
                                  src={prop.igb_account?.profile_picture_url}
                                  className="me-3 rounded-circle"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="lh-1">
                                  <div
                                    className="font-weight-bold"
                                    style={{ fontSize: "14px" }}
                                  >
                                    {prop.igb_account?.name}
                                  </div>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                  >
                                    @{prop.igb_account?.username}
                                  </small>
                                </div>
                              </div>
                              <i className="bi bi-chevron-right text-muted"></i>
                            </div>
                          ))}
                          {proposalsMap[camp.id]?.hasMore && (
                            <button
                              onClick={() => fetchProposals(camp.id)}
                              disabled={proposalsMap[camp.id]?.isLoading}
                              className="btn btn-outline-light text-muted w-100 mt-2 py-2 border shadow-sm small"
                            >
                              {proposalsMap[camp.id]?.isLoading
                                ? "Loading..."
                                : "Load More"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              {hasMore && (
                <button
                  onClick={() => fetchData(false)}
                  disabled={isLoading}
                  className="btn btn-outline-secondary w-100 mt-4 py-2 text-muted shadow-sm border-light-grey"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL VIEW */}
        <div
          className={`col-12 col-md-8 p-0 border-start ${
            !selectedInfluencer && isMobile ? "d-none" : "d-block"
          }`}
        >
          {selectedInfluencer ? (
            <div className="p-0">
              <div className="p-4 text-center border-bottom">
                <div className="d-md-none text-start mb-4">
                  <button
                    className="btn btn-link text-dark p-0 font-weight-bold text-decoration-none"
                    onClick={() => setSelectedInfluencer(null)}
                  >
                    <i className="bi bi-arrow-left me-2"></i> Back
                  </button>
                </div>
                <div
                  className="mx-auto rounded-circle overflow-hidden mb-3 border shadow-sm"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
                    src={selectedInfluencer.profile_picture_url}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3 className="font-weight-bold mb-1 lh-1">
                  {selectedInfluencer.name}
                </h3>
                <p className="text-muted mb-4">
                  @{selectedInfluencer.username}
                </p>
                <div className="row no-gutters py-3 border-top">
                  <div className="col-4 border-right">
                    <h4 className="font-weight-bold mb-0">
                      {formatNumber(
                        selectedInfluencer.profile_average_insights?.likes
                      )}
                    </h4>
                    <small
                      className="text-muted text-uppercase font-weight-bold"
                      style={{ fontSize: "10px" }}
                    >
                      Avg. likes
                    </small>
                  </div>
                  <div className="col-4 border-right">
                    <h4 className="font-weight-bold mb-0">
                      {formatNumber(
                        selectedInfluencer.profile_average_insights
                          ?.followers_count
                      )}
                    </h4>
                    <small
                      className="text-muted text-uppercase font-weight-bold"
                      style={{ fontSize: "10px" }}
                    >
                      Followers
                    </small>
                  </div>
                  <div className="col-4">
                    <h4 className="font-weight-bold mb-0">
                      {Number(
                        selectedInfluencer?.profile_average_insights
                          ?.engagement || 0
                      ).toFixed(2)}
                      %
                    </h4>
                    <small
                      className="text-muted text-uppercase font-weight-bold"
                      style={{ fontSize: "10px" }}
                    >
                      Engagement
                    </small>
                  </div>
                </div>
              </div>

              {/* POSTS GRID */}
              <div className="p-3">
                <h6 className="font-weight-bold mb-3">Recent Posts</h6>
                <div className="row g-2">
                  {influencerPosts.map((post) => (
                    <div key={post.id} className="col-4">
                      <div
                        className="position-relative bg-light"
                        style={{ paddingTop: "100%" }}
                      >
                        <img
                          src={post.media_url || post.thumbnail_url}
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* LOAD MORE POSTS BUTTON */}
                {hasMorePosts && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => fetchInfluencerPosts(false)}
                      disabled={isPostsLoading}
                      className="btn btn-sm btn-outline-secondary px-4 py-2 rounded-pill shadow-sm"
                    >
                      {isPostsLoading ? (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : null}
                      {isPostsLoading ? "Loading..." : "Load More Posts"}
                    </button>
                  </div>
                )}

                {!isPostsLoading && influencerPosts.length === 0 && (
                  <div className="text-center py-5 text-muted small">
                    No posts found.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              <p>Select an influencer to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencersList;
