import { useState } from "react";
import useAxios from "../hooks/use-axios";
import { useEffect } from "react";
import PageHeader from "../components/page-header";
import { Link } from "react-router-dom";

export default function CampaignList() {
  const axios = useAxios();
  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1);
  const [enableLoadMoreBtn, setShowLoadMoreBtn] = useState(false);
  const createCampaignUrl = "/adcampaign/create";

  useEffect(() => {
    loadCampaigns();
  }, [page]);

  const loadCampaigns = async () => {
    try {
      const response = await axios.get("/adcampaigns", {
        params: { page: page, limit: 10 },
      });
      const data = response.data.data;
      setCampaigns((prevCampaigns) => [...prevCampaigns, ...data.campaigns]);
      setShowLoadMoreBtn(data.campaigns.length === 2); // Show load more if we received full page
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  const campaignDetailLink = (campaign) => {
    return `/adcampaigns/${campaign.id}`;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      <PageHeader title="Your Campaigns" />
      <div className="app-content">
        <div className="container-fluid">
          <div className="campaign-list-p">
            <div className="row">
              <div className="col-12 col-lg-11 m-auto">
                {/* Create button */}
                <div className="nav-section d-flex justify-content-end">
                  <Link
                    to={createCampaignUrl}
                    className="btn create-btn btn-primary"
                  >
                    Create Campaign
                  </Link>
                </div>

                {/* No campaign card */}
                {campaigns.length === 0 && (
                  <div className="main-card mt-4" id="info">
                    <div className="card-body p-5 text-center">
                      You currently have no ad campaigns posted.
                      <br />
                      <small className="text-muted">
                        <span className="d-md-none d-sm-inline">Tap “+”</span>
                        <span className="d-none d-md-inline">
                          Click “Create Campaign”
                        </span>{" "}
                        button to schedule a campaign
                      </small>
                    </div>
                  </div>
                )}

                {campaigns.length > 0 && (
                  <>
                    <div className="feeds-container mt-4">
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Campaign Name</th>
                              <th>Deliverable Type</th>
                              <th>Campaign Spend</th>
                              <th>Date of purchase</th>
                              <th>Payment Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaigns.map((campaign) => (
                              <tr className="cursor-hand" key={campaign.id}>
                                <td
                                  className="text-ellipsis"
                                  title={campaign.name}
                                >
                                  <Link
                                    className="d-inline-block h-100 w-100 truncate-text text-decoration-none"
                                    to={campaignDetailLink(campaign)}
                                  >
                                    {campaign.name}
                                  </Link>
                                </td>

                                <td>
                                  <Link
                                    className="d-inline-block h-100 w-100 text-decoration-none"
                                    to={campaignDetailLink(campaign)}
                                  >
                                    {campaign.ad_campaign_deliverable_id === 2
                                      ? "Story"
                                      : "Reel"}
                                  </Link>
                                </td>

                                <td>
                                  <Link
                                    className="d-inline-block h-100 w-100 text-decoration-none"
                                    to={campaignDetailLink(campaign)}
                                  >
                                    ${campaign.price}
                                  </Link>
                                </td>

                                <td>
                                  <Link
                                    className="d-inline-block h-100 w-100 text-decoration-none"
                                    to={campaignDetailLink(campaign)}
                                  >
                                    {formatDate(campaign.created_at)}
                                  </Link>
                                </td>

                                <td>
                                  ${campaign.funded_amount ?? campaign.price}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Load More Button */}

                    <div className="text-center">
                      <button
                        className={`btn btn-secondary ${
                          enableLoadMoreBtn ? "" : "disabled"
                        }`}
                        onClick={() => {
                          if (enableLoadMoreBtn) {
                            setPage((prevPage) => prevPage + 1);
                          }
                        }}
                      >
                        Load More
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
