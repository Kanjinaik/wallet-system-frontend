import React from "react";

const actionButtonStyle = {
  minWidth: 42,
  height: 42,
  padding: "0 10px",
  display: "grid",
  placeItems: "center",
};

const sectionGridStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const sectionHeadingStyle = {
  margin: "8px 0 6px",
  fontSize: 16,
  fontWeight: 700,
};

const readValue = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

const renderReadOnlyField = (label, value) => (
  <label>
    {label}
    <input value={readValue(value)} readOnly />
  </label>
);

const RoleDistributorUsersSection = ({ ctx }) => {
  const {
    showDistributorUsersSection,
    handleCreateRetailer,
    retailerCreateStep,
    setRetailerCreateStep,
    newRetailer,
    setNewRetailer,
    validateCreateBasicStep,
    handleRetailerFileChange,
    retailerImagePreview,
    INDIA_STATES,
    KYC_DOCUMENT_TYPES,
    distributorData,
    formatCurrency,
    retailerCommissionDraft,
    setRetailerCommissionDraft,
    handleRetailerCommissionSave,
    handleRetailerToggle,
    handleRetailerTransactions,
    selectedRetailerTransactions,
  } = ctx;
  const [activeRetailer, setActiveRetailer] = React.useState(null);

  if (!showDistributorUsersSection) {
    return null;
  }

  return (
    <>
      <section className="role-panel">
        <h4>Create Retailer</h4>
        <form className="role-form role-wizard" onSubmit={handleCreateRetailer}>
          <div className="role-wizard-steps">
            <button type="button" className={`role-wizard-step ${retailerCreateStep === 1 ? "active" : ""}`} onClick={() => setRetailerCreateStep(1)}>Personal Information</button>
            <span className="role-wizard-divider" />
            <button type="button" className={`role-wizard-step ${retailerCreateStep === 2 ? "active" : ""}`} onClick={() => setRetailerCreateStep(2)}>User eKYC</button>
            <span className="role-wizard-divider" />
            <button type="button" className={`role-wizard-step ${retailerCreateStep === 3 ? "active" : ""}`} onClick={() => setRetailerCreateStep(3)}>Bank Information</button>
            <span className="role-wizard-divider" />
            <button type="button" className={`role-wizard-step ${retailerCreateStep === 4 ? "active" : ""}`} onClick={() => setRetailerCreateStep(4)}>Commission Settings</button>
          </div>

          <div className="role-wizard-body">
            {retailerCreateStep === 1 && (
              <div className="role-wizard-section">
                <h5>Personal Information</h5>
                <div className="role-wizard-grid">
                  <label className="role-field-label">First Name *<input placeholder="First Name" value={newRetailer.name} onChange={(e) => setNewRetailer((p) => ({ ...p, name: e.target.value }))} required /></label>
                  <label className="role-field-label">Last Name *<input placeholder="Last Name" value={newRetailer.last_name} onChange={(e) => setNewRetailer((p) => ({ ...p, last_name: e.target.value }))} /></label>
                  <label className="role-field-label">Date of Birth<input type="date" value={newRetailer.date_of_birth} onChange={(e) => setNewRetailer((p) => ({ ...p, date_of_birth: e.target.value }))} required /></label>
                  <label className="role-field-label">Email Address *<input placeholder="Email Address" type="email" value={newRetailer.email} onChange={(e) => setNewRetailer((p) => ({ ...p, email: e.target.value }))} required /></label>
                  <label className="role-field-label">Mobile Number *<input placeholder="Mobile Number" value={newRetailer.phone} maxLength={10} onChange={(e) => setNewRetailer((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required /></label>
                  <label className="role-field-label">Alternative Mobile Number<input placeholder="Alternative Mobile Number" value={newRetailer.alternate_mobile} maxLength={10} onChange={(e) => setNewRetailer((p) => ({ ...p, alternate_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></label>
                  <label className="role-field-label">Business Name *<input placeholder="Business Name" value={newRetailer.business_name} onChange={(e) => setNewRetailer((p) => ({ ...p, business_name: e.target.value }))} /></label>
                  <label className="role-field-label">Company Name<input placeholder="Company Name (optional)" /></label>
                  <label className="role-field-label">Address *<input placeholder="Address" value={newRetailer.address} onChange={(e) => setNewRetailer((p) => ({ ...p, address: e.target.value }))} /></label>
                  <label className="role-field-label">GST Number<input placeholder="GST Number" value={newRetailer.gst_number} onChange={(e) => setNewRetailer((p) => ({ ...p, gst_number: e.target.value.toUpperCase() }))} /></label>
                  <label className="role-field-label">State *<select value={newRetailer.state} onChange={(e) => setNewRetailer((p) => ({ ...p, state: e.target.value }))}><option value="">Select State</option>{INDIA_STATES.map((stateName) => (<option key={stateName} value={stateName}>{stateName}</option>))}</select></label>
                  <label className="role-field-label">City *<input placeholder="City" value={newRetailer.city} onChange={(e) => setNewRetailer((p) => ({ ...p, city: e.target.value }))} /></label>
                  <label className="role-field-label">Pincode *<input placeholder="Pincode" value={newRetailer.pincode} maxLength={6} onChange={(e) => setNewRetailer((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></label>
                  <label className="role-field-label">Upload Photo<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleRetailerFileChange("profile_photo", e.target.files?.[0] || null)} /><div className="role-upload-help">Upload Photo, max size 2MB</div></div></label>
                  <label className="role-field-label">Password *<input placeholder="Password" type="password" value={newRetailer.password} onChange={(e) => setNewRetailer((p) => ({ ...p, password: e.target.value }))} required /></label>
                  <label className="role-field-label">Confirm Password *<input placeholder="Confirm Password" type="password" value={newRetailer.password_confirmation} onChange={(e) => setNewRetailer((p) => ({ ...p, password_confirmation: e.target.value }))} required /></label>
                </div>
                <div className="role-wizard-actions"><span /><button type="button" onClick={() => { if (validateCreateBasicStep(newRetailer)) setRetailerCreateStep(2); }}>Next</button></div>
              </div>
            )}

            {retailerCreateStep === 2 && (
              <div className="role-wizard-section">
                <h5>User eKYC</h5>
                <div className="role-kyc-dual-grid">
                  <div className="role-kyc-card">
                    <h6>Aadhaar Details</h6>
                    <div className="role-wizard-grid">
                      <label className="role-field-label">Document Type *<select value="Aadhaar" onChange={(e) => setNewRetailer((p) => ({ ...p, kyc_document_type: e.target.value }))}><option value="Aadhaar">Aadhaar</option>{KYC_DOCUMENT_TYPES.filter((docType) => docType !== "Aadhaar").map((docType) => (<option key={docType} value={docType}>{docType}</option>))}</select></label>
                      <label className="role-field-label">Aadhaar Number *<input placeholder="Aadhaar Number" value={newRetailer.kyc_id_number} maxLength={12} onChange={(e) => setNewRetailer((p) => ({ ...p, kyc_document_type: "Aadhaar", kyc_id_number: e.target.value.replace(/\D/g, "").slice(0, 12) }))} /></label>
                      <label className="role-field-label">Upload Aadhaar Front *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("address_proof_front", e.target.files?.[0] || null)} /><div className="role-upload-help">Mandatory Aadhaar front image</div></div></label>
                      <label className="role-field-label">Upload Aadhaar Back *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("address_proof_back", e.target.files?.[0] || null)} /><div className="role-upload-help">Mandatory Aadhaar back image</div></div></label>
                    </div>
                  </div>

                  <div className="role-kyc-card">
                    <h6>PAN Details</h6>
                    <div className="role-wizard-grid">
                      <label className="role-field-label">Document Type *<select value="PAN" onChange={() => {}}><option value="PAN">PAN</option>{KYC_DOCUMENT_TYPES.filter((docType) => docType !== "PAN").map((docType) => (<option key={docType} value={docType}>{docType}</option>))}</select></label>
                      <label className="role-field-label">PAN Number *<input placeholder="PAN Number" value={newRetailer.pan_number} maxLength={10} onChange={(e) => setNewRetailer((p) => ({ ...p, pan_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) }))} /></label>
                      <label className="role-field-label">Upload PAN Front *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("pan_proof_front", e.target.files?.[0] || null)} /><div className="role-upload-help">Mandatory PAN front image</div></div></label>
                      <label className="role-field-label">Upload PAN Back *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("pan_proof_back", e.target.files?.[0] || null)} /><div className="role-upload-help">Mandatory PAN back image</div></div></label>
                    </div>
                  </div>
                </div>
                <div className="role-upload-preview">
                  <strong>Image Preview</strong>
                  <div className="role-upload-preview-grid">
                    {retailerImagePreview.profile_photo && <img src={retailerImagePreview.profile_photo} alt="Profile preview" />}
                    {retailerImagePreview.address_proof_front && <img src={retailerImagePreview.address_proof_front} alt="Document front preview" />}
                    {retailerImagePreview.address_proof_back && <img src={retailerImagePreview.address_proof_back} alt="Document back preview" />}
                    {retailerImagePreview.pan_proof_front && <img src={retailerImagePreview.pan_proof_front} alt="PAN front preview" />}
                    {retailerImagePreview.pan_proof_back && <img src={retailerImagePreview.pan_proof_back} alt="PAN back preview" />}
                  </div>
                </div>
                <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(1)}>Previous</button><button type="button" onClick={() => setRetailerCreateStep(3)}>Next</button></div>
              </div>
            )}

            {retailerCreateStep === 3 && (
              <div className="role-wizard-section">
                <h5>Bank Information</h5>
                <div className="role-wizard-grid">
                  <label className="role-field-label">Account Holder Name *<input placeholder="Account holder name" value={newRetailer.bank_account_name} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_account_name: e.target.value }))} /></label>
                  <label className="role-field-label">Bank Name *<input placeholder="Bank Name" value={newRetailer.bank_name} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_name: e.target.value }))} /></label>
                  <label className="role-field-label">Account Number *<input placeholder="Account Number" value={newRetailer.bank_account_number} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_account_number: e.target.value }))} /></label>
                  <label className="role-field-label">IFSC Code *<input placeholder="IFSC Code" value={newRetailer.bank_ifsc_code} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_ifsc_code: e.target.value }))} /></label>
                </div>
                <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(2)}>Previous</button><button type="button" onClick={() => setRetailerCreateStep(4)}>Next</button></div>
              </div>
            )}

            {retailerCreateStep === 4 && (
              <div className="role-wizard-section">
                <h5>Commission Settings</h5>
                <div className="role-wizard-grid">
                  <label className="role-field-label">Role<input value="Retailer" readOnly /></label>
                  <label className="role-field-label">Mobility Check<select value={newRetailer.mobility_check} onChange={(e) => setNewRetailer((p) => ({ ...p, mobility_check: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                  <label className="role-field-label">Admin Commission (%)<input type="number" min="0" max="100" step="0.01" value={newRetailer.admin_commission} onChange={(e) => setNewRetailer((p) => ({ ...p, admin_commission: e.target.value }))} placeholder="Commission rate" /></label>
                  <label className="role-field-label">Distributor Commission (%)<input type="number" min="0" max="100" step="0.01" value={newRetailer.distributor_commission} onChange={(e) => setNewRetailer((p) => ({ ...p, distributor_commission: e.target.value }))} placeholder="Distributor commission" /></label>
                </div>
                <p className="role-wizard-note"><strong>Note:</strong> Commission settings are optional and kept for same flow UI.</p>
                <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(3)}>Previous</button><button type="submit">Create Retailer</button></div>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="role-panel">
        <h4>Retailer Management</h4>
        <table className="role-table">
          <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Commission %</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(distributorData?.retailers || []).map((retailer) => (
              <tr key={retailer.id}>
                <td>{retailer.name}</td>
                <td>{retailer.email}</td>
                <td>{formatCurrency(retailer.balance)}</td>
                <td>
                  <div className="role-inline-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={retailerCommissionDraft[retailer.id] ?? ""}
                      onChange={(e) => setRetailerCommissionDraft((p) => ({ ...p, [retailer.id]: e.target.value }))}
                      placeholder="Distributor %"
                    />
                    <button type="button" onClick={() => handleRetailerCommissionSave(retailer.id)}>Save</button>
                  </div>
                </td>
                <td>{retailer.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div className="role-actions">
                    <button
                      type="button"
                      className="secondary"
                      title="Transactions"
                      style={actionButtonStyle}
                      onClick={() => handleRetailerTransactions(retailer.id)}
                    >
                      Tx
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      title="View"
                      style={actionButtonStyle}
                      onClick={() => setActiveRetailer(retailer)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      title={retailer.is_active ? "Deactivate" : "Activate"}
                      style={actionButtonStyle}
                      onClick={() => handleRetailerToggle(retailer.id)}
                    >
                      {retailer.is_active ? "Off" : "On"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedRetailerTransactions && (
        <section className="role-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <h4 style={{ margin: 0 }}>Retailer Transactions: {selectedRetailerTransactions.retailer?.name}</h4>
          </div>
          <table className="role-table">
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>
              {selectedRetailerTransactions.transactions.slice(0, 50).map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="text-capitalize">{tx.type}</td>
                  <td>{formatCurrency(tx.amount)}</td>
                  <td className="text-capitalize">{tx.status || "completed"}</td>
                  <td>{tx.description || tx.reference || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeRetailer && (
        <div className="modal-backdrop" onClick={() => setActiveRetailer(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h4>Retailer Details</h4>
              <button type="button" className="secondary" onClick={() => setActiveRetailer(null)}>Close</button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 16 }}>
              <div>
                <div style={sectionHeadingStyle}>Personal Details</div>
                <div style={sectionGridStyle}>
                  {renderReadOnlyField("First Name", activeRetailer.name)}
                  {renderReadOnlyField("Last Name", activeRetailer.last_name)}
                  {renderReadOnlyField("Email", activeRetailer.email)}
                  {renderReadOnlyField("Phone", activeRetailer.phone)}
                  {renderReadOnlyField("Alternative Mobile", activeRetailer.alternate_mobile)}
                  {renderReadOnlyField("Date of Birth", activeRetailer.date_of_birth ? String(activeRetailer.date_of_birth).slice(0, 10) : "")}
                  {renderReadOnlyField("Business Name", activeRetailer.business_name)}
                  {renderReadOnlyField("Address", activeRetailer.address)}
                  {renderReadOnlyField("City", activeRetailer.city)}
                  {renderReadOnlyField("State", activeRetailer.state)}
                  {renderReadOnlyField("Balance", formatCurrency(activeRetailer.balance || 0))}
                  {renderReadOnlyField("Status", activeRetailer.is_active ? "Active" : "Inactive")}
                </div>
              </div>

              <div>
                <div style={sectionHeadingStyle}>User eKYC</div>
                <div style={sectionGridStyle}>
                  {renderReadOnlyField("Document Type", activeRetailer.kyc_document_type)}
                  {renderReadOnlyField("Document Number", activeRetailer.kyc_id_number)}
                  {renderReadOnlyField("KYC Status", activeRetailer.kyc_status)}
                  {renderReadOnlyField("Liveness Verified", activeRetailer.kyc_liveness_verified ? "Yes" : "No")}
                </div>
              </div>

              <div>
                <div style={sectionHeadingStyle}>Banking Details</div>
                <div style={sectionGridStyle}>
                  {renderReadOnlyField("Account Holder Name", activeRetailer.bank_account_name)}
                  {renderReadOnlyField("Bank Name", activeRetailer.bank_name)}
                  {renderReadOnlyField("Account Number", activeRetailer.bank_account_number)}
                  {renderReadOnlyField("IFSC Code", activeRetailer.bank_ifsc_code)}
                </div>
              </div>

              <div>
                <div style={sectionHeadingStyle}>Commission Setting</div>
                <div style={sectionGridStyle}>
                  {renderReadOnlyField("Role", "Retailer")}
                  {renderReadOnlyField("Admin Commission (%)", activeRetailer.admin_commission)}
                  {renderReadOnlyField("Distributor Commission (%)", activeRetailer.distributor_commission)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleDistributorUsersSection;
