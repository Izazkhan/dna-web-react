import { Outlet } from "react-router-dom";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { useLayoutEffect, useRef, useCallback } from "react";
import useAuth from "../../hooks/use-auth";

export default function MasterLayout() {
  const { auth } = useAuth();
  const observerRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const toggleHandlerRef = useRef(null);
  const treeviewHandlersRef = useRef(new Map());
  const adminlteInstanceRef = useRef(null);

  const initializeAdminLTE = useCallback((appWrapper) => {
    if (!appWrapper) return;

    const DATA_KEY = "lte.push-menu";
    const CLASS_NAME_SIDEBAR_OVERLAY = "sidebar-overlay";
    const SELECTOR_APP_SIDEBAR = ".app-sidebar";
    const SELECTOR_SIDEBAR_TOGGLE = '[data-lte-toggle="sidebar"]';

    const Defaults = { sidebarBreakpoint: 992 };

    const PushMenu = window.adminlte?.PushMenu;
    if (!PushMenu) {
      console.error(
        "AdminLTE PushMenu not found. Ensure AdminLTE JS is loaded."
      );
      return;
    }

    // Scoped sidebar query
    const sidebar = appWrapper.querySelector(SELECTOR_APP_SIDEBAR);
    if (sidebar) {
      adminlteInstanceRef.current = new PushMenu(sidebar, Defaults);
      adminlteInstanceRef.current.init();

      // Resize: Store handler ref for cleanup
      const handleResize = () => adminlteInstanceRef.current?.init();
      resizeHandlerRef.current = handleResize;
      window.removeEventListener("resize", resizeHandlerRef.current);
      window.addEventListener("resize", resizeHandlerRef.current);
    }

    // Overlay (scoped, idempotent)
    let existingOverlay = appWrapper.querySelector(
      `.${CLASS_NAME_SIDEBAR_OVERLAY}`
    );
    if (!existingOverlay) {
      existingOverlay = document.createElement("div");
      existingOverlay.className = CLASS_NAME_SIDEBAR_OVERLAY;
      appWrapper.appendChild(existingOverlay);

      let isTouchMoved = false;

      existingOverlay.addEventListener(
        "touchstart",
        () => {
          isTouchMoved = false;
        },
        { passive: true }
      );
      existingOverlay.addEventListener(
        "touchmove",
        () => {
          isTouchMoved = true;
        },
        { passive: true }
      );
      existingOverlay.addEventListener(
        "touchend",
        (e) => {
          if (!isTouchMoved) {
            e.preventDefault();
            adminlteInstanceRef.current?.collapse();
          }
        },
        { passive: false }
      );

      existingOverlay.addEventListener("click", (e) => {
        e.preventDefault();
        adminlteInstanceRef.current?.collapse();
      });
    }

    // Toggle delegation: Store handler
    const handleToggleClick = (e) => {
      const button = e.target.closest(SELECTOR_SIDEBAR_TOGGLE);
      if (button) {
        e.preventDefault();
        adminlteInstanceRef.current?.toggle();
      }
    };
    toggleHandlerRef.current = handleToggleClick;
    appWrapper.removeEventListener("click", toggleHandlerRef.current, true);
    appWrapper.addEventListener("click", toggleHandlerRef.current, true);

    // Treeview: Scoped with handler map for cleanup
    initializeTreeview(appWrapper);
  }, []); // Stable callback

  // Nested Treeview (scoped)
  const initializeTreeview = useCallback((appWrapper) => {
    const Treeview = window.adminlte?.Treeview;
    if (!Treeview) {
      console.warn("AdminLTE Treeview not found.");
      return;
    }

    const SELECTOR_NAV_ITEM = ".nav-item";
    const SELECTOR_DATA_TOGGLE = '[data-lte-toggle="treeview"]';
    const SELECTOR_NAV_LINK = ".nav-link";

    const Default = { accordion: true, animationSpeed: 300 };

    // Clear old handlers
    treeviewHandlersRef.current.clear();

    const buttons = appWrapper.querySelectorAll(SELECTOR_DATA_TOGGLE);
    buttons.forEach((btn) => {
      const handleClick = (e) => {
        console.log("Treeview toggle clicked");
        const target = e.target;
        const targetItem = target.closest(SELECTOR_NAV_ITEM);
        const targetLink = target.closest(SELECTOR_NAV_LINK);

        if (
          target?.getAttribute("href") === "#" ||
          targetLink?.getAttribute("href") === "#"
        ) {
          e.preventDefault();
        }

        if (targetItem) {
          const accordionAttr = btn.dataset.accordion;
          const animationSpeedAttr = btn.dataset.animationSpeed;

          const config = {
            accordion:
              accordionAttr === undefined
                ? Default.accordion
                : accordionAttr === "true",
            animationSpeed:
              animationSpeedAttr === undefined
                ? Default.animationSpeed
                : Number(animationSpeedAttr),
          };

          const data = new Treeview(targetItem, config);
          data.toggle();
        }
      };

      // Store for cleanup
      treeviewHandlersRef.current.set(btn, handleClick);
      btn.removeEventListener("click", handleClick);
      btn.addEventListener("click", handleClick);
    });
  }, []);

  const cleanupAdminLTE = useCallback(() => {
    // PushMenu
    if (adminlteInstanceRef.current) {
      adminlteInstanceRef.current.destroy?.();
      adminlteInstanceRef.current = null;
    }

    // Resize
    if (resizeHandlerRef.current) {
      window.removeEventListener("resize", resizeHandlerRef.current);
      resizeHandlerRef.current = null;
    }

    // Toggle
    const appWrapper = document.querySelector(".app-wrapper");
    if (toggleHandlerRef.current && appWrapper) {
      appWrapper.removeEventListener("click", toggleHandlerRef.current, true);
      toggleHandlerRef.current = null;
    }

    // Treeview handlers
    treeviewHandlersRef.current.forEach((handler, btn) => {
      btn.removeEventListener("click", handler);
    });
    treeviewHandlersRef.current.clear();

    // Observer
    observerRef.current?.disconnect();
  }, []);

  useLayoutEffect(() => {
    document.body.classList.add(
      "layout-fixed",
      "sidebar-expand-lg",
      "sidebar-open",
      "bg-body-tertiary"
    );

    if (!auth?.isReady) return;

    const waitForLayout = () => {
      const appWrapper = document.querySelector(".app-wrapper");
      if (appWrapper) {
        initializeAdminLTE(appWrapper);
        return;
      }

      observerRef.current = new MutationObserver((mutations) => {
        const appWrapper = document.querySelector(".app-wrapper");
        if (appWrapper) {
          initializeAdminLTE(appWrapper);
          observerRef.current?.disconnect();
        }
      });
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    const timeoutId = setTimeout(waitForLayout, 100);
    return () => {
      clearTimeout(timeoutId);
      cleanupAdminLTE();
      document.body.classList.remove(
        "layout-fixed",
        "sidebar-expand-lg",
        "sidebar-open",
        "bg-body-tertiary"
      );
    };
  }, [auth?.isReady, initializeAdminLTE, cleanupAdminLTE]);

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <main className="app-main" id="main" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  );
}
