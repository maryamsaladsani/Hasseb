import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HaseebAuth from "./components/Home/Haseebauth.jsx";
import Manger from "./Manger.jsx";
import Advisor from "./Advisor.jsx";
import OwnerHome from "./components/businessOwner/BusinessOwnerHome.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Landing */}
        <Route path="/" element={<HaseebAuth />} />

        {/* Role-based dashboards */}
        <Route path="/manager" element={<Manger />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/owner" element={<OwnerHome />} />
      </Routes>
    </BrowserRouter>
  );
}