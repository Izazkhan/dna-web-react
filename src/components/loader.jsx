export default function Loader() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading app...</span>
        </div>
      </div>
    </div>
  );
}
