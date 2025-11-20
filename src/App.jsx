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
import OwnerHome from "./components/businessOwner/BusinessOwnerHome";
import HaseebHomePage from "./components/Home/HaseebHomePage";
import Haseebauth from './components/Home/Haseebauth';

//import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/global.css';

export default function App() {
  //return <Manger />;
  //return <OwnerHome />;
  //return <HaseebHomePage/>;
     return <Haseebauth/>;

}

// export default function App() {
//   return (
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<HaseebHomePage />} />
//           <Route path="/auth" element={<Haseebauth />} />
//         </Routes>
//       </BrowserRouter>
//   );
// }