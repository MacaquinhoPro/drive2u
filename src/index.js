// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Importar BrowserRouter desde react-router-dom
import { BrowserRouter } from "react-router-dom";

// Importar Tailwind CSS (ver sección de Tailwind más abajo)
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter> {/* Único Router en la aplicación */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
