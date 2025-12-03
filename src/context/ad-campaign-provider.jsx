import React, { createContext, useEffect, useState } from "react";
import useAxios from "../hooks/use-axios";

const AdCampaignContext = createContext({});

export const AdCampaignProvider = ({ children }) => {
  const axios = useAxios();
  const [data, setData] = useState({
    age_ranges: [],
    engagement_ranges: [],
    deliverables: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const response = await axios("/adcampaigns/options"); // Adjust base URL if needed (e.g., proxy in Vite)
        setData(response.data.data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch ad campaign options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return (
    <AdCampaignContext.Provider value={{ data, loading, error }}>
      {children}
    </AdCampaignContext.Provider>
  );
};
export default AdCampaignContext;
