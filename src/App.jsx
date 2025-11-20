/*

1. Navigate to the project directory:
   Open your terminal and run:
      cd  ....

2. Install project dependencies:
   Run either of these commands:
      npm i
      OR
      npm install

3. Install React-Bootstrap and Bootstrap:
   Run the following command:
      npm install react-bootstrap bootstrap

4. Start the development server:
   Run:
      npm  start



*/
import React, { useState } from "react";
import Manager from "./Manger.jsx";   
import Advisor from "./Advisor.jsx";
import BusinessOwnerHome from "./components/businessOwner/BusinessOwnerHome.jsx"

export default function App() {
  const [mode, setMode] = useState("manager"); // manager | advisor
  return <BusinessOwnerHome/>;
  // return (
  //   <div>
  //     {/* Switch Buttons */}
  //     <div className="d-flex gap-2 p-3">
  //       <button
  //         className={`btn ${mode === "manager" ? "btn-dark" : "btn-outline-dark"}`}
  //         onClick={() => setMode("manager")}
  //       >
  //         Manager
  //       </button>
  //
  //       <button
  //         className={`btn ${mode === "advisor" ? "btn-dark" : "btn-outline-dark"}`}
  //         onClick={() => setMode("advisor")}
  //       >
  //         Advisor
  //       </button>
  //     </div>
  //
  //     {/* Render selected */}
  //     {mode === "manager" ? <Manager /> : <Advisor />}
  //   </div>
  // );
}
