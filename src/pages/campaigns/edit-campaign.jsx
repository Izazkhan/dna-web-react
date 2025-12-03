import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampaignForm from "./campaign-form";
import useAxios from "../../hooks/use-axios";
import Loader from "../../components/loader";
import PageHeader from "../../components/page-header";

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axios = useAxios();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`/adcampaigns/edit/${id}`);
        const fetchedCampaign = response.data.data;

        // Convert price from cents to dollars for the form
        fetchedCampaign.price = (fetchedCampaign.price / 100).toFixed(2);
        // Transform demographics age_ranges to age_range_ids
        if (
          fetchedCampaign.demographics &&
          fetchedCampaign.demographics.age_ranges
        ) {
          fetchedCampaign.demographics.age_range_ids =
            fetchedCampaign.demographics.age_ranges.map((ar) => ar.id);
          
          // we don't need it anymore
          delete fetchedCampaign.demographics.age_ranges;
          delete fetchedCampaign.demographics.id;
          delete fetchedCampaign.demographics.ad_campaign_id;
        }

        // Transform locations to the format expected by LocationDropdown for display
        if (fetchedCampaign.locations && fetchedCampaign.locations.length > 0) {
          const firstLocation = fetchedCampaign.locations[0];
          fetchedCampaign.location_display_name = "Any";
          if (firstLocation.state) {
            fetchedCampaign.location_display_name = `${
              firstLocation.city?.name ? firstLocation.city?.name + ", " : ""
            } 
             ${firstLocation.state?.name}, 
             ${firstLocation.country?.name}`;
          }
          fetchedCampaign.locations = [
            {
              city_id: firstLocation.city?.id,
              state_id: firstLocation.state?.id,
              country_id: firstLocation.country?.id,
              radius_miles: firstLocation.radius_miles,
            },
          ];
        } else {
          fetchedCampaign.locations = [];
        }

        // Format dates for input type="date"
        if (fetchedCampaign.publish_from) {
          fetchedCampaign.publish_from =
            fetchedCampaign.publish_from.split("T")[0];
        }
        if (fetchedCampaign.publish_until) {
          fetchedCampaign.publish_until =
            fetchedCampaign.publish_until.split("T")[0];
        }
        if (fetchedCampaign.draft_date) {
          fetchedCampaign.draft_date = fetchedCampaign.draft_date.split("T")[0];
        }

        setCampaign(fetchedCampaign);
      } catch (err) {
        setError("Failed to fetch campaign details.");
        console.error(err);
        navigate("/adcampaigns"); // Redirect if campaign not found or error
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, axios, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.put(`/adcampaigns/${id}`, formData);
      console.log("Campaign updated successfully:", response.data);
      navigate(`/adcampaigns/${id}`); // Redirect to campaign detail page
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Error updating campaign:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update campaign";
      return { success: false, error: errorMessage };
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <PageHeader title="Edit Campaign" />
      <div className="container create-campaign-p">
        <div className="row justify-content-center">
          <div className="col-md-8 col-12 mb-5">
            <CampaignForm
              initialData={campaign}
              onSubmit={handleSubmit}
              isEditMode={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCampaign;
