import React from "react";

const AuthForgotForm = ({ ctx }) => {
  const { handleForgotSubmit, forgotData, setForgotData, loading } = ctx;

  return (
    <form onSubmit={handleForgotSubmit}>
      <div className="auth-input-wrap mb-4">
        <i className="bi bi-envelope-fill" />
        <input type="email" className="form-control" value={forgotData.email} onChange={(e) => setForgotData({ email: e.target.value })} placeholder="Registered Email Address" required />
      </div>
      <p className="auth-inline-note mb-4">We will generate a reset token and send instructions to this email.</p>
      <button type="submit" className="auth-primary-btn btn btn-primary w-100" disabled={loading}>
        {loading ? "Please wait..." : "Generate Reset Token"}
      </button>
    </form>
  );
};

export default AuthForgotForm;
