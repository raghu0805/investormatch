import Login from "./components/Login"
import { Routes, Route } from "react-router-dom";
import { Register } from "./components/Register"
import ProtectedRoutes from "./components/ProtectedRoutes";
import StartupDashboard from "./components/StartupDashboard";
import CreateStartupProfile from "./components/CreateStartupProfile";
import EditStartupProfile from "./components/EditStartuProfile";

function App() {

  return (
    <>
    <Routes>

      <Route path="/login" element={<Login/>}></Route>
      
     
      <Route path="/signup" element={<Register/>}></Route>

      <Route path="/startup/dashboard" element={<ProtectedRoutes><StartupDashboard/> </ProtectedRoutes>}></Route>
      <Route path="/startup/create" element={<ProtectedRoutes><CreateStartupProfile/> </ProtectedRoutes>}></Route>
      <Route path="/startup/edit" element={<ProtectedRoutes><EditStartupProfile/> </ProtectedRoutes>}></Route>
    </Routes>

    {/* <Register/> */}
    </>
  )
}

export default App;
