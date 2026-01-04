import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";
import { Register } from "./components/Register";
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
import LandingPage from "./components/LandingPage";
import InvestorFullProfile from "./components/InvestorComponents/InvestorFullProfile";
import NotFound from "./components/NotFound";


import Layout from "./components/InvestorComponents/Layout";
import MatchedStartup from "./components/StartupComponents/MatchedStartup";
import StartupFullProfile from "./components/StartupComponents/StartupFullProfile";
import ChatPage from "./components/ChatPage"
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
     

      <Route element={<Layout />}>
        {/* Startup Pages */}
        <Route path="/startup/dashboard" element={<ProtectedRoutes><StartupDashboard /></ProtectedRoutes>} />
        <Route path="/startup/create" element={<ProtectedRoutes><CreateStartupProfile /></ProtectedRoutes>} />
        <Route path="/startup/edit" element={<ProtectedRoutes><EditStartupProfile /></ProtectedRoutes>} />
        <Route path="/startup/request" element={<ProtectedRoutes><StartupRequests /></ProtectedRoutes>} />
        <Route path="/startup/matched-investors" element={<ProtectedRoutes><MatchedInvestors /></ProtectedRoutes>} />
        {/* Investor Pages */}
        <Route path="/investor/dashboard" element={<ProtectedRoutes><InvestorDashboard /></ProtectedRoutes>} />
        <Route path="/investor/create-profile" element={<ProtectedRoutes><CreateInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/edit-profile" element={<ProtectedRoutes><EditInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/request" element={<ProtectedRoutes><InvestorRequests /></ProtectedRoutes>} />
        
        <Route path="/investor/profile/:id" element={<ProtectedRoutes><InvestorFullProfile /></ProtectedRoutes>} />
        <Route path="/startup/profile/:id" element={<ProtectedRoutes><StartupFullProfile /></ProtectedRoutes>} />
        <Route path="/investor/matched-startups" element={<ProtectedRoutes><MatchedStartup /></ProtectedRoutes>} />
        
      </Route>

       <Route path="/chats" element={<ChatPage />}/>


      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
