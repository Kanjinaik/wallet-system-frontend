import React from "react";

const AuthAuthForm = ({ ctx }) => {
  const {
    handleAuthSubmit,
    formData,
    handleChange,
    showLoginPassword,
    setShowLoginPassword,
    setMode,
    loading,
    frontendAccessBlocked,
    frontendBlockedMessage,
  } = ctx;

  return (
    <form onSubmit={handleAuthSubmit}>
      {frontendAccessBlocked && (
        <div className="auth-stop-alert" role="alert">
          {frontendBlockedMessage}
        </div>
      )}

      <>
        <div className="auth-input-wrap mb-3">
          <i className="bi bi-person-badge-fill" />
          <input
            type="text"
            className="form-control"
            name="agent_id"
            value={formData.agent_id}
            onChange={handleChange}
            placeholder="Agent ID"
            autoCapitalize="characters"
            autoCorrect="off"
            disabled={frontendAccessBlocked}
            required
          />
        </div>

        <div className="auth-input-wrap mb-3 auth-select-wrap">
          <i className="bi bi-person-badge-fill" />
          <select className="form-select" name="role" value={formData.role} onChange={handleChange} disabled={frontendAccessBlocked} required>
            <option value="retailer">Retailer</option>
            <option value="distributor">Distributor</option>
            <option value="super_distributor">Super Distributor</option>
            <option value="master_distributor">Master Distributor</option>
          </select>
        </div>

        <div className="auth-input-wrap mb-2 auth-password-wrap">
          <i className="bi bi-lock-fill" />
          <input
            type={showLoginPassword ? "text" : "password"}
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            disabled={frontendAccessBlocked}
            required
          />
          <button type="button" className="auth-eye-btn" onClick={() => setShowLoginPassword((prev) => !prev)} disabled={frontendAccessBlocked}>
            <i className={`bi ${showLoginPassword ? "bi-eye" : "bi-eye-slash"}`} />
          </button>
        </div>
      </>

      <div className="text-end mb-4">
        <button type="button" className="auth-text-btn" onClick={() => setMode("forgot")} disabled={frontendAccessBlocked}>Forgot Password?</button>
      </div>

      <button type="submit" className="auth-primary-btn btn btn-primary w-100" disabled={loading || frontendAccessBlocked}>
        {loading ? "Please wait..." : "Sign In Securely"}
      </button>
    </form>
  );
};

export default AuthAuthForm;
