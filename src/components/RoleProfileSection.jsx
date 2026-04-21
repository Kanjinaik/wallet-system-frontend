import React from "react";

const RoleProfileSection = ({ ctx }) => {
  const {
    activeSection,
    profile,
    user,
    role,
    formatCurrency,
    totalWalletBalance,
    profileForm,
    setProfileForm,
    handleRetailerProfileSave,
    passwordForm,
    setPasswordForm,
    handleRetailerPasswordChange,
    bankForm,
    setBankForm,
    handleRetailerBankSave,
    handleRetailerKycUpload,
    setKycFile,
  } = ctx;

  if (activeSection !== "profile") {
    return null;
  }

  return (
    <>
      <section className="role-panel">
        <h4>Profile</h4>
        <table className="role-table">
          <tbody>
            <tr><th>Name</th><td>{profile?.name || user?.name || "-"}</td></tr>
            <tr><th>Email</th><td>{profile?.email || user?.email || "-"}</td></tr>
            <tr><th>Role</th><td className="text-capitalize">{role}</td></tr>
            <tr><th>Phone</th><td>{profile?.phone || "-"}</td></tr>
            <tr><th>Date Of Birth</th><td>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "-"}</td></tr>
            <tr><th>Status</th><td>{profile?.is_active ? "Active" : "Inactive"}</td></tr>
            {role !== "master_distributor" && <tr><th>Total Wallet Balance</th><td>{formatCurrency(totalWalletBalance)}</td></tr>}
          </tbody>
        </table>
      </section>
      {role === "retailer" && (
        <section className="role-content-grid">
          <article className="role-panel">
            <h4>Update Profile</h4>
            <form className="role-form" onSubmit={handleRetailerProfileSave}>
              <input value={profileForm.name} placeholder="Name" onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} required />
              <input value={profileForm.phone} placeholder="Phone" onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
              <input type="date" value={profileForm.date_of_birth} onChange={(e) => setProfileForm((p) => ({ ...p, date_of_birth: e.target.value }))} />
              <button type="submit">Save Profile</button>
            </form>
          </article>
          <article className="role-panel">
            <h4>Change Password</h4>
            <form className="role-form" onSubmit={handleRetailerPasswordChange}>
              <input type="password" placeholder="Current Password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))} required />
              <input type="password" placeholder="New Password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} required />
              <input type="password" placeholder="Confirm New Password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))} required />
              <button type="submit">Change Password</button>
            </form>
          </article>
          <article className="role-panel">
            <h4>Bank Details</h4>
            <form className="role-form" onSubmit={handleRetailerBankSave}>
              <input value={bankForm.bank_account_name} placeholder="Account Holder Name" onChange={(e) => setBankForm((p) => ({ ...p, bank_account_name: e.target.value }))} required />
              <input value={bankForm.bank_account_number} placeholder="Account Number" onChange={(e) => setBankForm((p) => ({ ...p, bank_account_number: e.target.value }))} required />
              <input value={bankForm.bank_ifsc_code} placeholder="IFSC Code" onChange={(e) => setBankForm((p) => ({ ...p, bank_ifsc_code: e.target.value }))} required />
              <input value={bankForm.bank_name} placeholder="Bank Name" onChange={(e) => setBankForm((p) => ({ ...p, bank_name: e.target.value }))} />
              <button type="submit">Save Bank Details</button>
            </form>
          </article>
          <article className="role-panel">
            <h4>Upload KYC</h4>
            <form className="role-form" onSubmit={handleRetailerKycUpload}>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setKycFile(e.target.files?.[0] || null)} required />
              <button type="submit">Upload KYC</button>
            </form>
            <p className="muted">Current KYC Status: {profile?.kyc_status || "pending"}</p>
          </article>
        </section>
      )}
    </>
  );
};

export default RoleProfileSection;
