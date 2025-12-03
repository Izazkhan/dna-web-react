import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../../components/loader";

export default function AuthLayout({ children }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    document.body?.classList?.add("bg-body-secondary", "app-loaded");
    setPageLoaded(true);
    return () => {
      document.body.classList.remove("bg-body-secondary", "app-loaded");
    };
  }, []);

  if (!pageLoaded) {
    return <Loader />
  }
  return <Outlet />;
}
