import { Route, Routes, Navigate } from "react-router-dom";
import Register from "./pages/auth/register";
import CampaignList from "./pages/campaign-list";
import MasterLayout from "./pages/layout/master-layout";
import ProtectedRoute from "./components/protected-route";
import GuestRoute from "./components/guest-route";
import NotFound from "./pages/not-found";
import AuthLayout from "./pages/layout/auth-layout";
import { ResetPassword } from "./pages/auth/reset-password";
import { ForgotPassword } from "./pages/auth/forgot-password";
import Profile from "./pages/profile/profile";
import CreateCampaign from "./pages/campaigns/create-campaign";
import { AdCampaignProvider } from "./context/ad-campaign-provider";
import CampaignDetail from "./pages/campaigns/campaign-detail";
import { StripeApp } from "./pages/checkout/stripe-app";
import PaymentSuccess from "./pages/checkout/payment-success";
import EditCampaign from "./pages/campaigns/edit-campaign";
import InfluencersList from "./pages/influencers/influencers-list"; // Added import
import AgreementsList from "./pages/agreements/agreements-list"; // Added import
import PaymentsList from "./pages/payments/payments-list"; // Added import
import Login from "./pages/auth/login";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<ResetPassword />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MasterLayout />}>
          <Route path="/adcampaigns" element={<CampaignList />} />
          <Route path="/adcampaign/:id/checkout" element={<StripeApp />} />
          <Route path="/adcampaign/payment-success" element={<PaymentSuccess />} />
          <Route path="/adcampaigns/:id" element={<CampaignDetail />} />
          <Route
            path="/adcampaigns/:id/edit"
            element={
              <AdCampaignProvider>
                <EditCampaign />
              </AdCampaignProvider>
            }
          /> {/* Added edit route */}

          <Route
            path="/adcampaign/create"
            element={
              <AdCampaignProvider>
                <CreateCampaign />
              </AdCampaignProvider>
            }
          />
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/influencers" element={<InfluencersList />}></Route>
          <Route path="/agreements" element={<AgreementsList />}></Route>
          <Route path="/payments" element={<PaymentsList />}></Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}
