// App.jsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./checkout-form";
import { useState, useEffect } from "react";
import useAxios from "../../hooks/use-axios";
import { useNavigate, useParams } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function StripeApp() {
  const [clientSecret, setClientSecret] = useState("");
  const axios = useAxios();
  const { id: campaignId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios({
      url: `/adcampaigns/${campaignId}`,
      method: "GET",
    })
      .then((res) => {
        // on success, create payment intent
        let campaign = res.data.data;
        if (campaign.published) {
          navigate("/adcampaigns?success=Already Published");
        }
        if (campaign?.meta?.max_budget > 0) {
          createPaymentIntent(campaign);
        } else {
          // TODO: display error notification on dashboard
          navigate("/adcampaigns?error=Campaign budget not set");
        }
      })
      .catch((err) => {
        // on error, redirect back to dashboard
        // TODO: display error notification on dashboard
        navigate("/adcampaigns?error=Unknown error");
      });
  }, []);

  function calculateProcessingFee(cents) {
    return Math.round(cents * 0.029 + 30);
  }

  function createPaymentIntent(campaign) {
    let processingFee = calculateProcessingFee(campaign.meta.max_budget);
    axios({
      url: "/payments/create-payment-intent",
      method: "POST",
      data: {
        amount: campaign.meta.max_budget + processingFee,
        currency: "usd",
        metadata: { campaign_id: campaign.id, transaction_fee: processingFee },
      },
    }).then(({ data }) => {
      setClientSecret(data.clientSecret);
    });
  }

  return (
    <div className="app-content">
      <div className="container-fluid">
        <div className="checkout-container">
          <div className="checkout-card">
            <h2>Complete Your Payment</h2>
            <p className="subtext">Secure payment powered by Stripe</p>

            {!clientSecret ? (
              <p>Loading payment form...</p>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#5A67D8",
                    },
                  },
                }}
              >
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
