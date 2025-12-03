import { useState } from "react";
import Loader from "../../components/loader";
import { useEffect } from "react";
import useAxios from "../../hooks/use-axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const CampaignDetail = () => {
  const navigate = useNavigate();
  // Static sample data
  const axios = useAxios();
  const { id: campaignId } = useParams();

  const [campaign, setCampaign] = useState({});

  useEffect(() => {
    axios
      .get("/adcampaigns/" + campaignId)
      .then((response) => {
        setCampaign(response.data.data);
        console.log(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          navigate("/adcampaigns");
        }
        console.error("Error fetching campaign details:", error);
      });
  }, []);

  const reach = { matches: 150, views: 200, accepts: 25, offers: 30 };
  const activity = { drafts_published: 10, drafts_completed: 5 };
  const influencers = [
    {
      igb_account: {
        username: "influencer1",
        profile_picture_url: "https://example.com/pic1.jpg",
      },
      followers: 15000,
    },
    {
      igb_account: {
        username: "influencer2",
        profile_picture_url: "https://example.com/pic2.jpg",
      },
      followers: 25000,
    },
  ];
  const publishedDrafts = []; // Static empty
  const publishedPosts = []; // Static empty
  const submittedDrafts = []; // Static empty
  const user = { meta: { platform: "instagram" } };

  const getFollowersCount = (influencer) =>
    `${influencer.followers.toLocaleString()} followers`;

  const getInfluencersAnalyticsUrl = (influencer) =>
    `/influencer/${influencer.igb_account.username}/analytics`;

  if (campaign?.id === undefined) {
    return <Loader />;
  }

  function formatCents(amountInCents) {
    return (amountInCents / 100).toFixed(2);
  }

  return (
    <div className="row m-0 justify-content-center my-campaigns-p campaign-details-p">
      <div className="col-md-8 col-12 p-0">
        <div className="feeds-container" id="paymentApp">
          <div className="main-card">
            <div className="p-0">
              <div className="campaign-details-section bd-top bd-bottom p-3 row m-0">
                <div className="col-6 d-flex align-items-center">
                  <h5 className="section-header m-0">Campaign Details</h5>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-end">
                  <div className="dropdown p-0 m-0 float-right">
                    <a
                      role="button"
                      className="section-header p-2"
                      id="dropdownMenuButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="dots-icon"></i>
                    </a>
                    <div
                      className="dropdown-menu dropdown-menu-right"
                      aria-labelledby="dropdownMenuButton"
                    >
                      <a
                        className="dropdown-item d-flex align-items-center p-2"
                        href={`/adcampaign/edit/${campaign.id}`}
                      >
                        <i className="edit-icon mr-1"></i>Edit
                      </a>
                      <a
                        className="dropdown-item d-flex align-items-center p-2"
                        href={`/adcampaign/more/funds/${campaign.id}`}
                      >
                        <i className="payment-icon mr-1"></i>Add More Funds
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="title">Campaign Title</div>
                  <div className="title-text">{campaign.name}</div>
                </div>
                <div className="col-6">
                  <div className="title">Campaign Due Date</div>
                  <div className="title-text">
                    {new Date(campaign.publish_from).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}{" "}
                    {campaign.publish_until
                      ? "- " + new Date(campaign.publish_until).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : ""}
                  </div>
                </div>
                {campaign.draft_date ? (
                  <div className="col-6">
                    <div className="title">Draft Due Date</div>
                    <div className="title-text">
                      {new Date(campaign.draft_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="col-6">
                  <div className="title">Audience Age</div>
                  <div className="title-text">
                    {campaign.demographics?.age_ranges
                      ?.map((r) => r.name)
                      .join(", ") || "Not specified"}
                  </div>
                </div>
                <div className="col-6">
                  <div className="title">Audience Gender</div>
                  <div className="title-text">
                    {campaign.demographics?.use_gender
                      ? `${
                          campaign.demographics.percent_male == 50
                            ? "Equal Split"
                            : campaign.demographics.percent_male > 50
                            ? "More Males"
                            : "More Females"
                        }`
                      : "Not specified"}
                  </div>
                </div>
                {campaign.locations.length === 0 ? (
                  <div className="col-6">
                    <div className="title">Audience Location</div>
                    <div className="title-text">Anywhere</div>
                  </div>
                ) : (
                  <>
                    <div className="col-6">
                      <div className="title">Audience Country</div>
                      <div className="title-text">
                        {campaign.locations[0]?.country?.name || ""}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="title">Audience State</div>
                      <div className="title-text">
                        {campaign.locations
                          .map((loc) => loc.state?.name || "Any")
                          .join(", ")}
                      </div>
                    </div>
                    {campaign.locations[0]?.city && (
                      <>
                        <div className="col-6">
                          <div className="title">Audience City</div>
                          <div className="title-text">
                            {campaign.locations[0]?.city?.name}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="title">City Radius</div>
                          <div className="title-text">
                            {campaign.locations[0]?.radius_miles || "0"} Miles
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                {user.meta?.platform === "instagram" && (
                  <div className="col-6">
                    <div className="title">Deliverable Type</div>
                    <div className="title-text">
                      {campaign.deliverable?.name || ""}
                    </div>
                  </div>
                )}
                <div className="col-6">
                  <div className="title">Content Link</div>
                  <div className="title-text">
                    {campaign.content_link || "Not specified"}
                  </div>
                </div>
                <div className="col-6">
                  <div className="title">Campaign Spend</div>
                  <div className="title-text">
                    ${formatCents(campaign.price)}
                  </div>
                </div>
              </div>
              <div className="campaign-details-section bd-top bd-bottom p-3 row campaign-description m-0">
                <div className="col-12">
                  <div className="title mb-1">Campaign Details</div>
                  <div
                    className="title-text"
                    dangerouslySetInnerHTML={{ __html: campaign.description }}
                  />
                </div>
                <div className="col-12 disclaimer">
                  {campaign.ad_campaign_type_id === 8 ? (
                    <p>
                      To complete the campaign successfully please complete the
                      following steps:
                      <br />
                      #1 Post a {campaign.adCampaignDeliverable?.name || ""} of
                      your choice and use the song {campaign.name} by Sample
                      Artist from Instagram's music library.
                      <br />
                      #2 After 5 minutes return to this campaign card and submit
                      your campaign post to start earning
                      <br />
                      #3 Be sure to input your PayPal email into the payment tab
                      and track your earnings and analytics.
                    </p>
                  ) : (
                    <p>
                      IMPORTANT NOTE: AFTER YOU PUBLISH YOUR CONTENT, YOU MUST
                      SUBMIT YOUR PUBLISHED POST TO THE DNA CAMPAIGN CENTER TO
                      RECEIVE PAYMENT & HAVE YOUR PAYPAL EMAIL LISTED IN THE
                      'PAYMENTS' TAB OF THE CAMPAIGN CENTER.
                    </p>
                  )}
                </div>
              </div>
              <div className="campaign-activity-section p-3">
                <div className="row mb-3">
                  <div className="col-6 d-flex align-items-center">
                    <h5 className="section-header m-0">
                      Campaign Activity (Dummy)
                    </h5>
                  </div>
                  <div className="col-6 d-flex align-items-center justify-content-start justify-content-sm-end">
                    <Link
                      to={`/adcampaign/insights/${campaign.id}`}
                      className="btn btn-sm btn-secondary fw-bold"
                    >
                      View Campaign Analytics
                    </Link>
                  </div>
                </div>
                <div className="activity-container">
                  <div className="matched-inf">
                    <div className="title">{reach.matches}</div>
                    <div className="no">Matched Influencers</div>
                  </div>
                  <div className="no-of-views">
                    <div className="title">{reach.views}</div>
                    <div className="no">Number of Views</div>
                  </div>
                  <div className="accepted-offers">
                    <div className="title">{reach.accepts}</div>
                    <div className="no">Accepted Offers</div>
                  </div>
                  <div className="active-offers">
                    <div className="title">{reach.offers}</div>
                    <div className="no">Active Offers</div>
                  </div>
                  <div className="published-offers">
                    <div className="title">
                      {activity.drafts_published + activity.drafts_completed}
                    </div>
                    <div className="no">Published Offers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
