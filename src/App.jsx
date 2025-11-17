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
import React from "react";
import Manger from "./Manger";
import BusinessDataUpload from "./components/businessOwner/BusinessDataUpload";

export default function App() {
  //return <Manger />;
  return <BusinessDataUpload />;
}