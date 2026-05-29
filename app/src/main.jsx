import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WorkspaceProvider>
    </AuthProvider>
  </React.StrictMode>
);