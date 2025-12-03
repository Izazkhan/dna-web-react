import { useEffect, useRef } from "react";
import { AppRoutes } from "./routes";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
