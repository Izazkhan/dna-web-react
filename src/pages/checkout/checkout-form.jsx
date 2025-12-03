// CheckoutForm.jsx
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: import.meta.env.VITE_APP_URL + `/adcampaign/payment-success`,
      },
    });

    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <button disabled={loading || !stripe} className="pay-btn">
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && <div className="error">{message}</div>}
    </form>
  );
}
