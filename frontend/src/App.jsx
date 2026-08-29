import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import LandingPage from "./components/landing/LandingPage";
import Layout from "./components/common/Layout";
import ProtectedRoutes from "./components/common/ProtectedRoutes";
import NotFound from "./components/common/NotFound";

import StudentDashboard from "./components/student/StudentDashboard";
import CreateStudentProfile from "./components/student/CreateStudentProfile";
import EditStudentProfile from "./components/student/EditStudentProfile";
import StudentRequests from "./components/student/StudentRequests";
import StudentFullProfile from "./components/student/StudentFullProfile";
import MatchedStudent from "./components/student/MatchedStudent";

import InvestorDashboard from "./components/investor/InvestorDashboard";
import CreateInvestorProfile from "./components/investor/CreateInvestorProfile";
import EditInvestorProfile from "./components/investor/EditInvestorProfile";
import InvestorRequests from "./components/investor/InvestorRequests";
import InvestorFullProfile from "./components/investor/InvestorFullProfile";
import MatchedInvestors from "./components/investor/MatchedInvestors";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      <Route element={<Layout />}>
        {/* Student Pages */}
        <Route path="/student/dashboard" element={<ProtectedRoutes><StudentDashboard /></ProtectedRoutes>} />
        <Route path="/student/create" element={<ProtectedRoutes><CreateStudentProfile /></ProtectedRoutes>} />
        <Route path="/student/edit" element={<ProtectedRoutes><EditStudentProfile /></ProtectedRoutes>} />
        <Route path="/student/request" element={<ProtectedRoutes><StudentRequests /></ProtectedRoutes>} />
        <Route path="/student/matched-investors" element={<ProtectedRoutes><MatchedInvestors /></ProtectedRoutes>} />
        <Route path="/student/profile/:id" element={<ProtectedRoutes><StudentFullProfile /></ProtectedRoutes>} />

        {/* Backwards compatibility aliases for Startup */}
        <Route path="/startup/dashboard" element={<ProtectedRoutes><StudentDashboard /></ProtectedRoutes>} />
        <Route path="/startup/create" element={<ProtectedRoutes><CreateStudentProfile /></ProtectedRoutes>} />
        <Route path="/startup/edit" element={<ProtectedRoutes><EditStudentProfile /></ProtectedRoutes>} />
        <Route path="/startup/request" element={<ProtectedRoutes><StudentRequests /></ProtectedRoutes>} />
        <Route path="/startup/matched-investors" element={<ProtectedRoutes><MatchedInvestors /></ProtectedRoutes>} />
        <Route path="/startup/profile/:id" element={<ProtectedRoutes><StudentFullProfile /></ProtectedRoutes>} />

        {/* Investor Pages */}
        <Route path="/investor/dashboard" element={<ProtectedRoutes><InvestorDashboard /></ProtectedRoutes>} />
        <Route path="/investor/create-profile" element={<ProtectedRoutes><CreateInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/edit-profile" element={<ProtectedRoutes><EditInvestorProfile /></ProtectedRoutes>} />
        <Route path="/investor/request" element={<ProtectedRoutes><InvestorRequests /></ProtectedRoutes>} />
        <Route path="/investor/profile/:id" element={<ProtectedRoutes><InvestorFullProfile /></ProtectedRoutes>} />
        <Route path="/investor/matched-students" element={<ProtectedRoutes><MatchedStudent /></ProtectedRoutes>} />
        <Route path="/investor/matched-startups" element={<ProtectedRoutes><MatchedStudent /></ProtectedRoutes>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
