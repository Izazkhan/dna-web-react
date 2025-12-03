import React, { useContext, useState } from "react";
import "../../app.scss";
import { Link, useNavigate } from "react-router-dom";
import CampaignForm from "./campaign-form"; // Adjust path as needed for your CampaignForm.jsx
import AdCampaignContext from "../../context/ad-campaign-provider";
import useAxios from "../../hooks/use-axios";

const CreateCampaign = () => {
  const [step, setStep] = useState(1);
  const axios = useAxios();
  const [platform, setPlatform] = useState(""); // Reset on init; set during step 1
  const navigate = useNavigate();

  // Campaign data for step 1
  const campaignTypes = [
    {
      id: "instagram",
      name: "Instagram",
      bullets: [
        "Amplify the reach of your already existing brand content, Influencer created content, or user generated content",
        "Get Instagram API-level audience targeting & post-campaign analytics",
        "Same-day content publishing possible",
      ],
    },
    {
      id: "tiktok",
      name: "Tiktok",
      bullets: [
        "Amplify the reach of your already existing brand content, Influencer created content, or user generated content",
        "Get Tiktok API-level audience targeting & post-campaign analytics",
        "Same-day content publishing possible",
      ],
    },
  ];

  // Click handler for platform selection
  const handleSelect = (typeId) => {
    setPlatform(typeId);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await axios.post("/adcampaigns", formData);
      navigate(`/adcampaign/${response.data.data.id}/checkout`); 
    } catch (error) {
      console.error("Error creating campaign:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create campaign";
      return { success: false, error: errorMessage };
    }
  };

  // Next handler: Advance steps
  const handleNext = (formData) => {
    if (step === 1) {
      if (platform) {
        setStep(2);
      }
    } else if (step === 2) {
      handleFormSubmit(formData);
    }
  };

  // Back handler: Return to previous step or redirect
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      navigate("/adcampaigns"); // Redirect to /adcampaigns from step 1
    }
  };

  return (
    <div className="container create-campaign-p">
      <div className="row justify-content-center">
        <div className="col-md-8 col-12">
          <div className="nav-section d-flex justify-content-between pt-4">
            <button onClick={handleBack} className="btn btn-link">
              <i className="back-btn-icon mr-2"></i>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="row justify-content-center"
        id="ad-campaign-form-app"
        data-v-app=""
      >
        <div className="col-md-8 col-12 mb-5">
          <div className="">
            <div className="card-body p-0">
              <div className="page-header">
                {step === 1 && (
                  <div className="d-flex flex-column">
                    <h5>Create Campaign</h5>
                    <p>Choose your platform to launch your campaign!</p>
                  </div>
                )}
              </div>
              {step === 1 ? (
                // Step 1: Platform Selection
                campaignTypes.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`card campaign-card mb-3 cursor-pointer ${
                      platform === campaign.id ? "selected" : ""
                    }`}
                  >
                    <div
                      className="card-body"
                      onClick={() => handleSelect(campaign.id)}
                    >
                      <h5>{campaign.name}</h5>
                      {/* Description Bullets */}
                      <ul>
                        {campaign.bullets.map((bullet, index) => (
                          <li key={index}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                // Step 2: Campaign Form
                <CampaignForm
                  platform={platform}
                  onSubmit={(data) => handleNext(data)}
                />
              )}
            </div>
          </div>
          {/* Next Button (conditional text/action) */}
          {step === 1 && (
            <div className="text-center">
              <button
                className="btn btn-next btn-secondary"
                onClick={handleNext}
                type="button"
                disabled={!platform} // Disable if no selection in step 1
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
