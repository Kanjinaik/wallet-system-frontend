import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { Login } from "./components/login.jsx";
import RoleDashboard from "./components/RoleDashboard.jsx";

function App() {
  const hasToken = () => Boolean(localStorage.getItem("token"));
  const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");
  const normalizedRole = () => {
    const role = getUser().role;
    return role === "user" ? "retailer" : role;
  };
  const homeByRole = () => {
    const role = normalizedRole();
    if (role === "master_distributor") return "/master-distributor";
    if (role === "super_distributor") return "/super-distributor";
    if (role === "distributor") return "/distributor";
    return "/retailer";
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const depositStatus = url.searchParams.get("deposit_status");
    const depositMessage = url.searchParams.get("deposit_message");

    if (!depositStatus) {
      return;
    }

    if (depositStatus === "success") {
      toast.success(depositMessage || "Deposit successful");
    } else {
      toast.error(depositMessage || "Deposit failed");
    }

    url.searchParams.delete("deposit_status");
    url.searchParams.delete("deposit_message");
    url.searchParams.delete("wallet_id");
    url.searchParams.delete("txnid");
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={hasToken() ? <Navigate to={homeByRole()} replace /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard-full" 
            element={hasToken() ? <Navigate to={homeByRole()} replace /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={<Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/master-distributor" 
            element={hasToken() && normalizedRole() === "master_distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/super-distributor" 
            element={hasToken() && normalizedRole() === "super_distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/super-distributor/reports" 
            element={hasToken() && normalizedRole() === "super_distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/super-distributor/support" 
            element={hasToken() && normalizedRole() === "super_distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/super-distributor/notifications" 
            element={hasToken() && normalizedRole() === "super_distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/distributor" 
            element={hasToken() && normalizedRole() === "distributor" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route 
            path="/retailer" 
            element={hasToken() && normalizedRole() === "retailer" ? <RoleDashboard /> : <Navigate to={hasToken() ? homeByRole() : "/login"} replace />} 
          />
          <Route path="/" element={<Navigate to={hasToken() ? homeByRole() : "/login"} replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
