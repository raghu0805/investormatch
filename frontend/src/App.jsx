import Login from "./components/Login"
import { Routes, Route } from "react-router-dom";
import { Register } from "./components/Register"
import ProtectedRoutes from "./components/ProtectedRoutes";
import StartupDashboard from "./components/StartupDashboard";

function App() {

  return (
    <>
    <Routes>

      <Route path="/login" element={<Login/>}></Route>
      
     
      <Route path="/signup" element={<Register/>}></Route>
      <Route path="/startupDashboard" element={<ProtectedRoutes><StartupDashboard/> </ProtectedRoutes>}></Route>

    </Routes>
    <Login/>
    {/* <Register/> */}
    </>
  )
}

export default App;
