import Login from "./components/Login"
import { Routes, Route } from "react-router-dom";
import { Register } from "./components/Register"
import ProtectedRoutes from "./components/ProtectedRoutes";

import InvestorDashboard from "./components/InvestorComponents/InvestorDashboard";
import CreateInvestorProfile from "./components/InvestorComponents/CreateInvestorProfile";
import EditInvestorProfile from "./components/InvestorComponents/EditInvestorProfile";
import MatchedInvestors from "./components/InvestorComponents/MatchedInvestors";
import StartupDashboard from "./components/StartupComponents/StartupDashboard";
import CreateStartupProfile from "./components/StartupComponents/CreateStartupProfile";
import EditStartupProfile from "./components/StartupComponents/EditStartupProfile";
import StartupRequests from "./components/StartupComponents/StartupRequests";
import InvestorRequests from "./components/InvestorComponents/InvestorRequests";
import Navbar from "./components/Navbar";

function App() {

  return (
    <>
      <Routes>

        <Route path="/login" element={<Login />}></Route>


        <Route path="/signup" element={<Register />}></Route>

        <Route path="/startup/dashboard" element={<ProtectedRoutes><StartupDashboard /> </ProtectedRoutes>}></Route>
        <Route path="/startup/create" element={<ProtectedRoutes><CreateStartupProfile /> </ProtectedRoutes>}></Route>
        <Route path="/startup/edit" element={<ProtectedRoutes><EditStartupProfile /> </ProtectedRoutes>}></Route>
        <Route path="/startup/request" element={<ProtectedRoutes><StartupRequests /> </ProtectedRoutes>}></Route>

        <Route path="/investor/dashboard" element={<ProtectedRoutes><InvestorDashboard /></ProtectedRoutes>} />
        <Route path="/investor/create-profile" element={<ProtectedRoutes><CreateInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/edit-profile" element={<ProtectedRoutes><EditInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/request" element={<ProtectedRoutes><InvestorRequests/> </ProtectedRoutes>}></Route>

        <Route path="/startup/matched-investors"element={<ProtectedRoutes><MatchedInvestors /></ProtectedRoutes>} />
        <Route path="/navbar"element={<ProtectedRoutes><Navbar /></ProtectedRoutes>} />
      </Routes>
      {/* <Register/> */}
    </>
  )
}

export default App;
