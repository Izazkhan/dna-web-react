import React from "react";
import { useEffect } from "react";
import useAxios from "../../hooks/use-axios";
import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import useBodyClass from "../../hooks/use-body-class";

export default function PaymentSuccess() {
  const axios = useAxios();
  useBodyClass("campaign-published-p");

  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [campaign, setCampaign] = useState(null);
  const [data, setData] = useState(null);

  const paymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    axios
      .post(`/payments/stripe/verify-payment/${paymentIntentId}`)
      .then((res) => {
        setData(res.data);
        setStatus(res.data.status);
      })
      .catch((error) => {
        console.error("Error verifying payment:", error);
        setStatus("requires_payment_method");
      });
  }, []);

  function formatDate(cAt) {
    const date = new Date(cAt);

    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return formatted;
  }

  function formatCents(amountInCents) {
    return (amountInCents / 100).toFixed(2);
  }

  return (
    <div className="app-content">
      {status === "loading" && <p>Checking payment…</p>}
      {status === "succeeded" && (
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10  col-lg-8">
              <div className="c-card">
                <div className="card-header completed p-0">
                  <div className="p-4 pb-5">
                    <div className="mb-3">
                      <i className="white-tick-icon outline"></i>
                    </div>
                    <div className="status mb-2">
                      <h4>You're all set</h4>
                    </div>
                    <div className="sub-status">
                      <small>
                        Your order is complete and we have set aside your
                        payment until your campaign has been completed
                        succesfully.
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="campaign-details-section bd-bottom pb-3">
                    <div className="row">
                      <div className="col-6 d-flex align-items-center">
                        <h5 className="section-header m-0">Campaign Details</h5>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <div className="title">Campaign Title</div>
                        <div className="title-text">{data.campaign.name}</div>
                      </div>
                      <div className="col-6">
                        <div className="title">Campaign Spend</div>
                        <div className="title-text">
                          ${formatCents(data.campaign.meta?.max_budget)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="order-details-section pb-3">
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="title">Order Details</div>
                        <div className="date fw-medium">
                          Date of purchase :{" "}
                          <span className="fw-semi-bold">
                            {formatDate(data.campaign.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="row details">
                      <div className="col-6">
                        <div className="title">Direct Payment</div>
                      </div>
                      <div className="col-6 text-right">
                        <div className="title-text">${formatCents(data.campaign.meta?.max_budget)}</div>
                      </div>
                    </div>
                    <div className="row details">
                      <div className="col-6">
                        <div className="title">DNA Platform Fee</div>
                      </div>
                      <div className="col-6 text-right">
                        <div className="title-text">$0.00</div>
                      </div>
                    </div>
                    <div className="row details">
                      <div className="col-6">
                        <div className="title">Stripe Fee</div>
                      </div>
                      <div className="col-6 text-right">
                        <div className="title-text">${formatCents(data.fee)}</div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-6">
                        <div className="title">Payment Amount</div>
                      </div>
                    </div>
                    <div className="row payment-amount">
                      <div className="col-6">
                        <div className="fw-bold title">Total</div>
                      </div>
                      <div className="col-6 text-right fw-bold text-success">
                        ${formatCents(parseInt(data.amount))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {status === "requires_payment_method" && (
        <p>Payment Failed ❌ Please try again.</p>
      )}
    </div>
  );
}
