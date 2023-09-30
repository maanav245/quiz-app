import { useState } from "react";
import "./App.css";
import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userContext } from "./Context";
import Dashboard from "./views/Dashboard";
import PrivateRoute from "./views/PrivateRoute";

function App() {
  const [token, setToken] = useState<string>("");
  return (
    <userContext.Provider value={{ token: token, setToken: setToken }}>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute />} />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
