import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";
import AuthHero from "./AuthHero";
import AuthAuthForm from "./AuthAuthForm";
import AuthForgotForm from "./AuthForgotForm";
import AuthResetForm from "./AuthResetForm";

export function Login() {
    const frontendBlockedMessage = "Admin stop the server contact to admin";
    const savedLoginRole = typeof window !== "undefined" ? window.localStorage.getItem("wallet_login_role") : null;
    const [mode, setMode] = useState("login"); // login | forgot | reset
    const [formData, setFormData] = useState({
        agent_id: "",
        password: "",
        role: savedLoginRole || "retailer",
    });
    const [forgotData, setForgotData] = useState({ email: "" });
    const [resetData, setResetData] = useState({
        email: "",
        token: "",
        password: "",
        password_confirmation: "",
    });
    const [resetTokenHint, setResetTokenHint] = useState("");
    const [loading, setLoading] = useState(false);
    const [frontendEnabled, setFrontendEnabled] = useState(true);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "register") {
            setMode("login");
        }
    }, [mode]);

    useEffect(() => {
        let active = true;

        const loadFrontendStatus = async () => {
            try {
                const response = await api.get("/frontend-status");
                if (!active) {
                    return;
                }
                setFrontendEnabled(response.data?.frontend_enabled !== false);
            } catch (error) {
                if (!active) {
                    return;
                }
                setFrontendEnabled(true);
            }
        };

        loadFrontendStatus();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = name === "agent_id" ? value.toUpperCase().replace(/\s+/g, "") : value;
        if (name === "role" && typeof window !== "undefined") {
            window.localStorage.setItem("wallet_login_role", nextValue);
        }
        setFormData({ ...formData, [name]: nextValue });
    };

    const getValidationMessage = (error) => {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
            return Object.values(validationErrors)?.[0]?.[0] || "Validation failed";
        }
        return error.response?.data?.message || "Something went wrong";
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        if (!frontendEnabled) {
            toast.error(frontendBlockedMessage);
            return;
        }
        setLoading(true);

        try {
            const endpoint = "/login";
            const payload = {
                agent_id: formData.agent_id,
                role: formData.role,
                password: formData.password,
            };

            const response = await api.post(endpoint, payload);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("wallet_login_role", response.data.user?.role === "user" ? "retailer" : response.data.user?.role || formData.role);
                toast.success("Login successful!");

                const role = response.data.user?.role;
                if (role === "admin") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    toast.info("Admin is backend-only. Login with Distributor or Retailer in frontend.");
                    navigate("/login", { replace: true });
                    return;
                }

                const nextPath =
                    role === "master_distributor"
                        ? "/master-distributor"
                        : role === "super_distributor"
                            ? "/super-distributor"
                            : role === "distributor"
                                ? "/distributor"
                                : "/retailer";
                navigate(nextPath, { replace: true });

                // Hard fallback for edge cases where router state is stale.
                setTimeout(() => {
                    if (window.location.pathname !== nextPath) {
                        window.location.assign(nextPath);
                    }
                }, 120);
            } else {
                toast.error("Authentication failed: no token received");
            }
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/forgot-password", forgotData);
            toast.success(res.data?.message || "Reset token generated.");
            if (res.data?.reset_token) {
                setResetTokenHint(res.data.reset_token);
                setResetData((prev) => ({
                    ...prev,
                    email: res.data.email || forgotData.email,
                    token: res.data.reset_token,
                }));
            } else {
                setResetTokenHint("Check your email for the reset token, then enter it below.");
                setResetData((prev) => ({ ...prev, email: forgotData.email }));
            }
            setMode("reset");
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/reset-password", resetData);
            toast.success(res.data?.message || "Password reset successful.");
            setMode("login");
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`auth-page auth-page--${mode}`}>
            <AuthHero />

            <div className="auth-right">
                <div className="auth-card">
                    <h2 className="auth-title">
                        {mode === "login" && <>Sign <span>In</span></>}
                        {mode === "forgot" && <>Recover <span>Access</span></>}
                        {mode === "reset" && <>Reset <span>Password</span></>}
                    </h2>

                    {(mode === "login" || mode === "forgot" || mode === "reset") && (
                        <p className="auth-subtitle mb-4">
                            {mode === "login" && "Enter your agent ID and password to access your dashboard"}
                            {mode === "forgot" && "Enter your email to receive a secure reset token"}
                            {mode === "reset" && "Set a strong new password for your account"}
                        </p>
                    )}

                    {mode === "login" && (
                        <AuthAuthForm
                            ctx={{
                                mode,
                                handleAuthSubmit,
                                formData,
                                handleChange,
                                showLoginPassword,
                                setShowLoginPassword,
                                setMode,
                                loading,
                                frontendAccessBlocked: !frontendEnabled,
                                frontendBlockedMessage,
                            }}
                        />
                    )}

                    {mode === "forgot" && <AuthForgotForm ctx={{ handleForgotSubmit, forgotData, setForgotData, loading }} />}

                    {mode === "reset" && (
                        <AuthResetForm
                            ctx={{
                                handleResetSubmit,
                                resetData,
                                setResetData,
                                resetTokenHint,
                                showResetPassword,
                                setShowResetPassword,
                                showResetConfirmPassword,
                                setShowResetConfirmPassword,
                                loading,
                            }}
                        />
                    )}

                    {(mode === "forgot" || mode === "reset") && (
                        <div className="text-center mt-3">
                            <button className="auth-link-btn" type="button" onClick={() => setMode("login")}><i className="bi bi-arrow-left me-1"></i> Back to Login</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
