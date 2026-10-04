import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import "./Main.css"
import Play from "./pages/Play.jsx";
import Waiting from "./pages/Waiting.jsx";


const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="/waiting" element={<Waiting />} />
    </Routes>
  </BrowserRouter>,
);