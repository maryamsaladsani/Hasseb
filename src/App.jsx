import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HaseebHomePage from "./components/Home/HaseebHomePage";
import HaseebAuth from "./components/Home/Haseebauth.jsx";
import Manger from "./Manger.jsx";
import Advisor from "./Advisor.jsx";
import OwnerHome from "./components/businessOwner/BusinessOwnerHome.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Landing */}
        <Route path="/" element={<HaseebHomePage />} />

        {/* Role-based dashboards */}
        <Route path="/manager" element={<Manger />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/owner" element={<OwnerHome />} />
        <Route path="/auth" element={<HaseebAuth />} />
      </Routes>
    </BrowserRouter>
  );
}