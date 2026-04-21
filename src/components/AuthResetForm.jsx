import React from "react";

const AuthResetForm = ({ ctx }) => {
  const {
    handleResetSubmit,
    resetData,
    setResetData,
    resetTokenHint,
    showResetPassword,
    setShowResetPassword,
    showResetConfirmPassword,
    setShowResetConfirmPassword,
    loading,
  } = ctx;

  return (
    <form onSubmit={handleResetSubmit}>
      <div className="auth-input-wrap mb-3">
        <i className="bi bi-envelope-fill" />
        <input type="email" className="form-control" value={resetData.email} onChange={(e) => setResetData((p) => ({ ...p, email: e.target.value }))} placeholder="Email Address" required />
      </div>
      <div className="auth-input-wrap mb-3">
        <i className="bi bi-key-fill" />
        <input className="form-control" value={resetData.token} onChange={(e) => setResetData((p) => ({ ...p, token: e.target.value }))} placeholder="Reset Token" required />
      </div>
      {resetTokenHint && <small className="auth-inline-note d-block mb-3">{resetTokenHint}</small>}
      <div className="auth-input-wrap mb-3 auth-password-wrap">
        <i className="bi bi-lock-fill" />
        <input type={showResetPassword ? "text" : "password"} className="form-control" value={resetData.password} onChange={(e) => setResetData((p) => ({ ...p, password: e.target.value }))} placeholder="New Password" required />
        <button type="button" className="auth-eye-btn" onClick={() => setShowResetPassword((prev) => !prev)}>
          <i className={`bi ${showResetPassword ? "bi-eye" : "bi-eye-slash"}`} />
        </button>
      </div>
      <div className="auth-input-wrap mb-4 auth-password-wrap">
        <i className="bi bi-lock-fill" />
        <input type={showResetConfirmPassword ? "text" : "password"} className="form-control" value={resetData.password_confirmation} onChange={(e) => setResetData((p) => ({ ...p, password_confirmation: e.target.value }))} placeholder="Confirm Password" required />
        <button type="button" className="auth-eye-btn" onClick={() => setShowResetConfirmPassword((prev) => !prev)}>
          <i className={`bi ${showResetConfirmPassword ? "bi-eye" : "bi-eye-slash"}`} />
        </button>
      </div>
      <button type="submit" className="auth-primary-btn btn btn-primary w-100" disabled={loading}>
        {loading ? "Please wait..." : "Reset Password"}
      </button>
    </form>
  );
};

export default AuthResetForm;
