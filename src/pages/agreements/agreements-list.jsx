import { useState, useEffect } from "react";
import useAxios from "../../hooks/use-axios";
import PageHeader from "../../components/page-header";

export default function AgreementsList() {
  const [status, setStatus] = useState("active");
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [enableLoadMoreBtn, setEnableLoadMoreBtn] = useState(false);
  const axios = useAxios();

  const fetchCampaigns = async (page = 1, isLoadMore = false) => {
    setLoading(true);
    // 1. Clear current list if it's a fresh tab switch (not loading more)
    if (!isLoadMore) {
      setCampaigns([]);
      setEnableLoadMoreBtn(false);
    }

    try {
      const endpoint =
        status === "active"
          ? "/adcampaigns/with-active-proposals"
          : "/adcampaigns/with-completed-proposals";

      const response = await axios.get(endpoint, {
        params: { page, pagesize: 10 },
      });

      const { campaigns: newCampaigns, pagination: pagData } =
        response.data.data;

      setCampaigns((prev) =>
        isLoadMore ? [...prev, ...newCampaigns] : newCampaigns
      );
      setPagination(pagData);
      setCurrentPage(page);
      setEnableLoadMoreBtn(pagData.page < pagData.totalPages);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1, false);
  }, [status]);

  const handleLoadMore = () => {
    fetchCampaigns(currentPage + 1, true);
  };

  return (
    <>
      <PageHeader title="Agreements" />
      <div className="container mt-4">
        <div className="row m-0 justify-content-center">
          <div className="col-md-8 col-12 p-0">
            {/* Nav Pills Tabs */}
            <div className="d-flex mb-4">
              <ul
                className="nav nav-pills bg-light p-1 rounded-3"
                id="agreementsTabs"
              >
                <li className="nav-item">
                  <button
                    className={`nav-link px-4 py-2 border-0 ${
                      status === "active"
                        ? "active bg-white shadow-sm text-primary"
                        : "text-muted bg-transparent"
                    }`}
                    onClick={() => setStatus("active")}
                  >
                    Active
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link px-4 py-2 border-0 ${
                      status === "completed"
                        ? "active bg-white shadow-sm text-primary"
                        : "text-muted bg-transparent"
                    }`}
                    onClick={() => setStatus("completed")}
                  >
                    Completed
                  </button>
                </li>
              </ul>
            </div>

            {/* Main Content Area */}
            <div
              className="accordion accordion-flush"
              id="agreementsAccordion"
              key={status}
            >
              {/* 2. Show Loader immediately while switching */}
              {loading && campaigns.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                  <p className="mt-2 text-muted">
                    Loading {status} campaigns...
                  </p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <CampaignAccordionItem
                    key={`${status}-${campaign.id}`}
                    campaign={campaign}
                    status={status}
                    axios={axios}
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {enableLoadMoreBtn && (
              <div className="text-center mt-4 mb-5">
                <button
                  className="btn btn-secondary px-4 rounded-pill"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {!loading && campaigns.length === 0 && (
              <p className="text-center text-muted mt-5">
                No {status} campaigns found.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CampaignAccordionItem({ campaign, status, axios }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const uniqueId = `${status}-collapse-${campaign.id}`;

  const fetchAgreements = async () => {
    if (proposals.length > 0) return;
    setLoading(true);
    try {
      const endpoint = `/adcampaigns/${campaign.id}/proposals/${status}`;
      const response = await axios.get(endpoint);
      const proposalsData = response.data.data?.proposals || [];
      setProposals(proposalsData);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accordion-item border-0 border-bottom">
      <h2 className="accordion-header">
        <button
          className="accordion-button collapsed py-3 shadow-none bg-transparent text-dark"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${uniqueId}`}
          onClick={fetchAgreements}
        >
          <span className="fw-semibold">
            {campaign.name} —{" "}
            {new Date(campaign.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            })}
          </span>
        </button>
      </h2>
      <div
        id={uniqueId}
        className="accordion-collapse collapse"
        data-bs-parent="#agreementsAccordion"
      >
        <div className="accordion-body bg-light-subtle border-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-secondary me-2"></div>
              <span className="small text-muted">Loading agreements...</span>
            </div>
          ) : proposals.length > 0 ? (
            proposals.map((item) => (
              <div
                key={item.id}
                className="card border-0 shadow-sm mb-3 rounded-4 p-4"
              >
                <h6 className="mb-1">
                  {item.igb_account?.name || "Partner"}
                </h6>
                <p className="text-secondary small mb-3">
                  This is a contract entered into by the Provider and the
                  Client...
                </p>
                <button
                  className="btn btn-link p-0 text-start text-decoration-none"
                  style={{ color: "#6f42c1" }}
                >
                  Review
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-3 small text-muted">
              No {status} agreements found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
