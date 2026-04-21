import React from "react";
import { 
  RiUserAddLine, 
  RiShieldCheckLine, 
  RiBankCard2Line, 
  RiSettings4Line,
  RiGroupLine,
  RiEditLine,
  RiEyeLine,
  RiHistoryLine,
  RiToggleLine,
  RiCloseLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiCheckDoubleLine
} from "react-icons/ri";

const RoleManagerUsersSection = ({ ctx }) => {
  const {
    showMasterUsersSection,
    managedChildLabel,
    handleCreateDistributor,
    distributorCreateStep,
    setDistributorCreateStep,
    newDistributor,
    setNewDistributor,
    validateCreateBasicStep,
    handleDistributorFileChange,
    INDIA_STATES,
    KYC_DOCUMENT_TYPES,
    distributorImagePreview,
    managerData,
    formatCurrency,
    handleDistributorUpdate,
    handleDistributorToggle,
    handleDistributorTransactions,
    selectedManagerTransactions,
    setSelectedManagerTransactions,
  } = ctx;

  const [isEditing, setIsEditing] = React.useState(false);
  const [activeDistributor, setActiveDistributor] = React.useState(null);
  const [draftStatus, setDraftStatus] = React.useState("");
  const draftKey = `role-manager-draft-${managedChildLabel}`;

  React.useEffect(() => {
    if (!showMasterUsersSection) return;
    if (isEditing) return;

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.values) {
        setNewDistributor((prev) => ({ ...prev, ...draft.values }));
      }
      if (draft?.step) {
        setDistributorCreateStep(draft.step);
      }
      if (draft?.savedAt) {
        setDraftStatus(`Saved at ${draft.savedAt}`);
      }
    } catch (error) {
      // Ignore draft restore errors.
    }
  }, [
    draftKey,
    isEditing,
    setDistributorCreateStep,
    setNewDistributor,
    showMasterUsersSection,
  ]);

  if (!showMasterUsersSection) return null;

  const saveDraft = () => {
    if (isEditing) {
      setDraftStatus("Edit mode active");
      return;
    }

    try {
      const payload = {
        values: newDistributor,
        step: distributorCreateStep,
        savedAt: new Date().toLocaleString(),
      };
      window.localStorage.setItem(draftKey, JSON.stringify(payload));
      setDraftStatus(`Saved at ${payload.savedAt}`);
    } catch (error) {
      setDraftStatus("Save failed");
    }
  };

  const handleEditClick = (dist) => {
    setNewDistributor({ ...dist });
    setIsEditing(true);
    setDistributorCreateStep(1);
    // Smooth scroll to wizard
    const el = document.getElementById("wizard-section");
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewDistributor({
      name: "", last_name: "", date_of_birth: "", email: "", phone: "", alt_phone: "",
      business_name: "", address: "", city: "", state: "", password: "", password_confirmation: "",
      kyc_id_number: "", kyc_document_type: "Aadhaar", pan_number: "",
      bank_account_name: "", bank_name: "", bank_account_number: "", bank_ifsc_code: "",
      mobility_check: "low", distributor_commission: 0
    });
    setIsEditing(false);
    setDistributorCreateStep(1);
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const ok = await handleDistributorUpdate(newDistributor.id, newDistributor);
      if (ok) handleCancelEdit();
    } else {
      const result = await handleCreateDistributor(e);
      if (result !== false) {
        try {
          window.localStorage.removeItem(draftKey);
        } catch (error) {
          // Ignore draft cleanup errors.
        }
      }
    }
  };

  const renderStep = (num, icon, label) => (
    <div 
      className={`d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all cursor-pointer ${distributorCreateStep === num ? 'bg-primary text-white shadow-sm' : 'bg-light text-muted border border-secondary-subtle'}`}
      onClick={() => setDistributorCreateStep(num)}
      style={{ cursor: 'pointer' }}
    >
      <span className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`} style={{ width: '24px', height: '24px', backgroundColor: distributorCreateStep === num ? '#fff' : '#cbd5e1', color: distributorCreateStep === num ? '#4f46e5' : '#475569', fontSize: '11px' }}>
        {distributorCreateStep > num ? <RiCheckDoubleLine /> : num}
      </span>
      <span className="small fw-bold text-nowrap d-none d-lg-block">{label}</span>
    </div>
  );

  return (
    <div className="py-2">
      {/* Onboarding Wizard Section */}
      <div id="wizard-section" className="card border shadow-sm rounded-4 mb-5 bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom border-secondary-subtle p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-3 rounded-circle ${isEditing ? 'bg-warning-subtle text-warning' : 'bg-primary-subtle text-primary'}`}>
                {isEditing ? <RiEditLine size={24}/> : <RiUserAddLine size={24}/>}
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                  {isEditing ? `Modify Node Protocol` : `Initiate ${managedChildLabel} Onboarding`}
                </h5>
                <p className="text-muted small m-0 mt-1">
                  {isEditing ? `Adjusting credentials for ${newDistributor.name}` : "Populate secure credentials and financial protocols"}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {isEditing && (
                <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold me-2" onClick={handleCancelEdit}>
                  <RiCloseLine /> Cancel Modification
                </button>
              )}
              <div className="d-flex align-items-center gap-2 p-1 bg-light rounded-pill border">
                {renderStep(1, null, "Identity")}
                {renderStep(2, null, "eKYC")}
                {renderStep(3, null, "Banking")}
                {renderStep(4, null, "Protocols")}
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-4 bg-white">
          <form onSubmit={onFormSubmit}>
            {distributorCreateStep === 1 && (
              <div className="animate-fade-in">
                <div className="row g-4 mb-4">
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">First Name *</label>
                    <input className="form-control form-control-lg border-secondary-subtle fw-bold" placeholder="John" value={newDistributor.name} onChange={(e) => setNewDistributor((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Last Name *</label>
                    <input className="form-control form-control-lg border-secondary-subtle fw-bold" placeholder="Doe" value={newDistributor.last_name || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, last_name: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Birth Date *</label>
                    <input className="form-control form-control-lg border-secondary-subtle fw-bold" type="date" value={newDistributor.date_of_birth} onChange={(e) => setNewDistributor((p) => ({ ...p, date_of_birth: e.target.value }))} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Email Authority *</label>
                    <input className="form-control border-secondary-subtle fw-bold" type="email" value={newDistributor.email} onChange={(e) => setNewDistributor((p) => ({ ...p, email: e.target.value }))} required readOnly={isEditing} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Mobile Node *</label>
                    <input className="form-control border-secondary-subtle fw-bold" value={newDistributor.phone} maxLength={10} onChange={(e) => setNewDistributor((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Business Identifier *</label>
                    <input className="form-control border-secondary-subtle fw-bold" placeholder="Global Logistics Inc" value={newDistributor.business_name || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, business_name: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Alternative Node</label>
                    <input className="form-control border-secondary-subtle fw-bold" value={newDistributor.alt_phone || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, alt_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">Address Manifest *</label>
                    <input className="form-control border-secondary-subtle fw-bold" value={newDistributor.address} onChange={(e) => setNewDistributor((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">City Hub *</label>
                    <input className="form-control border-secondary-subtle fw-bold" value={newDistributor.city || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label extra-small fw-bold text-uppercase text-muted">State Authority *</label>
                    <select className="form-select border-secondary-subtle fw-bold" value={newDistributor.state} onChange={(e) => setNewDistributor((p) => ({ ...p, state: e.target.value }))}>
                      <option value="">Select State</option>
                      {INDIA_STATES.map((state) => (<option key={state} value={state}>{state}</option>))}
                    </select>
                  </div>
                  {!isEditing && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-uppercase text-muted">Secure Password *</label>
                        <input className="form-control border-secondary-subtle fw-bold" type="password" value={newDistributor.password} onChange={(e) => setNewDistributor((p) => ({ ...p, password: e.target.value }))} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-uppercase text-muted">Verify Password *</label>
                        <input className="form-control border-secondary-subtle fw-bold" type="password" value={newDistributor.password_confirmation} onChange={(e) => setNewDistributor((p) => ({ ...p, password_confirmation: e.target.value }))} required />
                      </div>
                    </>
                  )}
                </div>
                <div className="d-flex justify-content-end bg-light p-3 rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 w-100">
                    <small className={`fw-bold ${draftStatus.includes("Saved") ? "text-success" : "text-muted"}`}>{draftStatus || "Fill required fields to continue"}</small>
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                      <button type="button" className="btn btn-outline-secondary px-4 fw-bold rounded-pill" onClick={saveDraft}>
                        Save
                      </button>
                      <button type="button" className="btn btn-primary px-5 fw-bold rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#4f46e5' }} onClick={() => { if (isEditing || validateCreateBasicStep(newDistributor)) { saveDraft(); setDistributorCreateStep(2); } }}>
                        Proceed to eKYC <RiArrowRightLine />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {distributorCreateStep === 2 && (
              <div className="animate-fade-in">
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="p-4 rounded-3 border border-secondary-subtle bg-light bg-opacity-10 h-100">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><RiShieldCheckLine className="text-primary" /> Aadhaar Verification</h6>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-uppercase text-muted lh-1 mb-1">Document Type *</label>
                        <select className="form-select border-secondary-subtle fw-bold mb-3" value={newDistributor.kyc_document_type || "Aadhaar"} onChange={(e) => setNewDistributor((p) => ({ ...p, kyc_document_type: e.target.value }))}>
                          <option value="Aadhaar">Aadhaar</option>
                          {KYC_DOCUMENT_TYPES.filter((docType) => docType !== "Aadhaar").map((docType) => (<option key={docType} value={docType}>{docType}</option>))}
                        </select>
                        <label className="form-label extra-small fw-bold text-uppercase text-muted lh-1 mb-1">Aadhaar Number *</label>
                        <input className="form-control border-secondary-subtle fw-bold" maxLength={12} value={newDistributor.kyc_id_number} onChange={(e) => setNewDistributor((p) => ({ ...p, kyc_document_type: "Aadhaar", kyc_id_number: e.target.value.replace(/\D/g, "").slice(0, 12) }))} />
                      </div>
                      {!isEditing && (
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="btn btn-outline-secondary btn-sm w-100 py-3 border-dashed">
                               <RiUserAddLine className="mb-1" /> <br/> <small>Aadhaar Front</small>
                               <input type="file" className="d-none" onChange={(e) => handleDistributorFileChange("address_proof_front", e.target.files?.[0])} />
                            </label>
                          </div>
                          <div className="col-6">
                            <label className="btn btn-outline-secondary btn-sm w-100 py-3 border-dashed">
                               <RiUserAddLine className="mb-1" /> <br/> <small>Aadhaar Back</small>
                               <input type="file" className="d-none" onChange={(e) => handleDistributorFileChange("address_proof_back", e.target.files?.[0])} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="p-4 rounded-3 border border-secondary-subtle bg-light bg-opacity-10 h-100">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><RiShieldCheckLine className="text-danger" /> PAN Authentication</h6>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-uppercase text-muted lh-1 mb-1">Document Type *</label>
                        <select className="form-select border-secondary-subtle fw-bold mb-3" value="PAN" onChange={() => {}}>
                          <option value="PAN">PAN</option>
                          {KYC_DOCUMENT_TYPES.filter((docType) => docType !== "PAN").map((docType) => (<option key={docType} value={docType}>{docType}</option>))}
                        </select>
                        <label className="form-label extra-small fw-bold text-uppercase text-muted lh-1 mb-1">PAN Identifier *</label>
                        <input className="form-control border-secondary-subtle fw-bold text-uppercase" maxLength={10} value={newDistributor.pan_number || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, pan_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))} />
                      </div>
                      {!isEditing && (
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="btn btn-outline-secondary btn-sm w-100 py-3 border-dashed">
                               <RiUserAddLine className="mb-1" /> <br/> <small>PAN Front</small>
                               <input type="file" className="d-none" onChange={(e) => handleDistributorFileChange("pan_proof_front", e.target.files?.[0])} />
                            </label>
                          </div>
                          <div className="col-6">
                            <label className="btn btn-outline-secondary btn-sm w-100 py-3 border-dashed">
                               <RiUserAddLine className="mb-1" /> <br/> <small>PAN Back</small>
                               <input type="file" className="d-none" onChange={(e) => handleDistributorFileChange("pan_proof_back", e.target.files?.[0])} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!isEditing && Object.values(distributorImagePreview).some(v => v) && (
                  <div className="mt-4 p-3 bg-light rounded-3 border">
                     <span className="extra-small fw-bold text-muted text-uppercase mb-2 d-block">Protocol Assets Captured</span>
                     <div className="d-flex gap-2 overflow-auto">
                        {Object.values(distributorImagePreview).map((img, i) => img && <img key={i} src={img} className="rounded border shadow-sm" style={{ height: '50px', width: '80px', objectFit: 'cover' }} alt="Preview" />)}
                     </div>
                  </div>
                )}
                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-light px-4 fw-bold border" onClick={() => setDistributorCreateStep(1)}>
                    <RiArrowLeftLine /> Back
                  </button>
                  <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                    <button type="button" className="btn btn-outline-secondary px-4 fw-bold rounded-pill" onClick={saveDraft}>
                      Save
                    </button>
                    <button type="button" className="btn btn-primary px-5 fw-bold rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#4f46e5' }} onClick={() => { saveDraft(); setDistributorCreateStep(3); }}>
                      Verify Banking <RiArrowRightLine />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {distributorCreateStep === 3 && (
              <div className="animate-fade-in px-xl-5">
                <div className="row g-4 mb-4">
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Beneficiary Name *</label><input className="form-control border-secondary-subtle fw-bold" value={newDistributor.bank_account_name || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_account_name: e.target.value }))} /></div>
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Bank Institution *</label><input className="form-control border-secondary-subtle fw-bold" value={newDistributor.bank_name || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_name: e.target.value }))} /></div>
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Account Identifier *</label><input className="form-control border-secondary-subtle fw-bold" value={newDistributor.bank_account_number || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_account_number: e.target.value }))} /></div>
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Security IFSC *</label><input className="form-control border-secondary-subtle fw-bold text-uppercase" value={newDistributor.bank_ifsc_code || ""} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_ifsc_code: e.target.value }))} /></div>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-light px-4 fw-bold border" onClick={() => setDistributorCreateStep(2)}>
                    <RiArrowLeftLine /> Back
                  </button>
                  <button type="button" className="btn btn-primary px-5 fw-bold rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#4f46e5' }} onClick={() => setDistributorCreateStep(4)}>
                    Configure Protocols <RiArrowRightLine />
                  </button>
                </div>
              </div>
            )}

            {distributorCreateStep === 4 && (
              <div className="animate-fade-in text-center px-lg-5">
                <div className="row g-4 text-start mb-5">
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Risk Tolerance</label><select className="form-select border-secondary-subtle fw-bold" value={newDistributor.mobility_check} onChange={(e) => setNewDistributor((p) => ({ ...p, mobility_check: e.target.value }))}><option value="low">Low Impact</option><option value="medium">Medium Impact</option><option value="high">High Velocity</option></select></div>
                  <div className="col-md-6"><label className="form-label extra-small fw-bold text-uppercase text-muted">Yield Ratio (%)</label><input type="number" className="form-control border-secondary-subtle fw-bold" step="0.01" value={newDistributor.distributor_commission} onChange={(e) => setNewDistributor((p) => ({ ...p, distributor_commission: e.target.value }))} /></div>
                </div>
                <div className="alert bg-primary bg-opacity-10 border-0 text-primary p-4 rounded-4 mb-4">
                   {isEditing ? <RiEditLine size={32} className="mb-2" /> : <RiSettings4Line size={32} className="mb-2" />}
                  <p className="fw-bold mb-0">
                    {isEditing ? `Applying adjustments to network node: ${newDistributor.name}` : `Confirming network node creation for ${managedChildLabel}.`}
                  </p>
                  <small className="opacity-75">All operational settings will be committed to the master ledger.</small>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-light px-4 fw-bold border" onClick={() => setDistributorCreateStep(3)}>
                    <RiArrowLeftLine /> Back
                  </button>
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#4f46e5' }}>
                    {isEditing ? "Commit Protocol Adjustments" : "Committing Audit Entry"} <RiArrowRightLine />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Network Registry Section */}
      <div className="card border shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <RiGroupLine className="text-secondary" /> {managedChildLabel} Management Registry
          </h5>
          <div className="badge bg-light text-muted border px-3 py-2 fw-bold">
            {managerData?.distributors?.length || 0} SECURE NODES
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-top border-bottom">
              <tr>
                <th className="py-3 px-4 border-0 extra-small fw-bold text-muted text-uppercase">Node Identity</th>
                <th className="py-3 px-3 border-0 extra-small fw-bold text-muted text-uppercase">Portfolio Yield</th>
                <th className="py-3 px-3 border-0 extra-small fw-bold text-muted text-uppercase">End-points</th>
                <th className="py-3 px-3 border-0 extra-small fw-bold text-muted text-uppercase">Operational</th>
                <th className="py-3 px-4 border-0 extra-small fw-bold text-muted text-uppercase text-end">Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {(managerData?.distributors || []).map((dist) => (
                <tr key={dist.id} className="border-bottom">
                  <td className="py-3 px-4">
                    <div className="fw-bold text-dark">{dist.name}</div>
                    <div className="text-muted extra-small">{dist.email}</div>
                  </td>
                  <td className="py-3 px-3 fw-bold text-primary">{formatCurrency(dist.balance)}</td>
                  <td className="py-3 px-3"><span className="badge bg-light text-dark border rounded-pill">{dist.total_retailers || 0} Units</span></td>
                  <td className="py-3 px-3">
                    <span className={`badge rounded-pill px-3 ${dist.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {dist.is_active ? "Active" : "Dormant"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-light btn-sm rounded-circle border shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="Audit Trail" onClick={() => handleDistributorTransactions(dist.id)}><RiHistoryLine size={16}/></button>
                        <button className="btn btn-light btn-sm rounded-circle border shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="Observe" onClick={() => setActiveDistributor(dist)}><RiEyeLine size={16}/></button>
                        <button className="btn btn-primary btn-sm rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#4f46e5' }} title="Modify Protocols" onClick={() => handleEditClick(dist)}><RiEditLine size={16}/></button>
                        <button className={`btn btn-sm rounded-circle border shadow-sm p-0 d-flex align-items-center justify-content-center ${dist.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`} style={{ width: '32px', height: '32px' }} onClick={() => handleDistributorToggle(dist.id)}><RiToggleLine size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Overlay */}
      {selectedManagerTransactions && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
               <div className="modal-header border-0 bg-white p-4">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <RiHistoryLine className="text-secondary" /> Audit Trail: {selectedManagerTransactions.distributor?.name}
                  </h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setSelectedManagerTransactions(null)}></button>
               </div>
               <div className="modal-body p-0">
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light"><tr><th className="px-4 py-3 extra-small fw-bold">Interval</th><th className="px-3 py-3 extra-small fw-bold">Classification</th><th className="px-3 py-3 extra-small fw-bold">Monetary</th><th className="px-4 py-3 extra-small fw-bold">Details</th></tr></thead>
                      <tbody>{selectedManagerTransactions.transactions.map(tx => (<tr key={tx.id} className="border-bottom">
                         <td className="px-4 py-3 small">{new Date(tx.created_at).toLocaleString()}</td>
                         <td className="px-3 py-3"><span className="badge bg-light text-dark border text-capitalize">{tx.type}</span></td>
                         <td className="px-3 py-3 fw-bold text-primary">{formatCurrency(tx.amount)}</td>
                         <td className="px-4 py-3 small text-muted text-truncate" style={{ maxWidth: '200px' }}>{tx.description || tx.reference}</td>
                      </tr>))}</tbody>
                    </table>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Overlay */}
      {activeDistributor && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom p-4 bg-white">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <RiEyeLine className="text-primary"/> Protocol Profile: {activeDistributor.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setActiveDistributor(null)}></button>
              </div>
              <div className="modal-body p-4 bg-white overflow-auto" style={{ maxHeight: '80vh' }}>
                 <div className="row g-4">
                    {/* Identity Framework */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 bg-light bg-opacity-25 h-100">
                        <h6 className="fw-bold small text-primary text-uppercase mb-3 ls-wide border-bottom pb-2">Identity Framework</h6>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Entity Name</small><span className="fw-bold text-dark">{activeDistributor.name} {activeDistributor.last_name || ""}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Business Identifier</small><span className="fw-bold text-dark">{activeDistributor.business_name || "N/A"}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Communication Network</small><span className="fw-bold text-dark">{activeDistributor.email}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Primary Mobile Node</small><span className="fw-bold text-dark">{activeDistributor.phone}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Location Manifest</small><span className="fw-bold text-dark">{activeDistributor.address}, {activeDistributor.city}, {activeDistributor.state}</span></div>
                        <div className="mb-0"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Security DOB</small><span className="fw-bold text-dark">{activeDistributor.date_of_birth ? new Date(activeDistributor.date_of_birth).toLocaleDateString() : "N/A"}</span></div>
                      </div>
                    </div>

                    {/* Financial Settlement */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 bg-light bg-opacity-25 h-100">
                        <h6 className="fw-bold small text-success text-uppercase mb-3 ls-wide border-bottom pb-2">Financial Settlement</h6>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Institution</small><span className="fw-bold text-dark">{activeDistributor.bank_name || "N/A"}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Beneficiary Name</small><span className="fw-bold text-dark">{activeDistributor.bank_account_name || "N/A"}</span></div>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Account Identifier</small><span className="fw-bold text-dark text-break">{activeDistributor.bank_account_number || "N/A"}</span></div>
                        <div className="mb-0"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Security IFSC Code</small><span className="fw-bold text-dark">{activeDistributor.bank_ifsc_code || "N/A"}</span></div>
                      </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 bg-light bg-opacity-25 h-100">
                        <h6 className="fw-bold small text-warning text-uppercase mb-3 ls-wide border-bottom pb-2">Operational Metrics</h6>
                        <div className="row g-3">
                          <div className="col-6">
                            <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Liquid Portfolio</small>
                            <span className="h5 fw-bold text-dark">{formatCurrency(activeDistributor.balance)}</span>
                          </div>
                          <div className="col-6 text-end">
                            <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Yield Ratio</small>
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill">{activeDistributor.distributor_commission}% P/A</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Node Status</small>
                            <span className={`badge rounded-pill ${activeDistributor.is_active ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                              {activeDistributor.is_active ? "Operational" : "Decommissioned"}
                            </span>
                          </div>
                          <div className="col-6 text-end">
                            <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">End-point Units</small>
                            <span className="fw-bold text-dark">{activeDistributor.total_retailers || 0} Registered</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Compliance */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 bg-light bg-opacity-25 h-100">
                        <h6 className="fw-bold small text-danger text-uppercase mb-3 ls-wide border-bottom pb-2">Security Compliance</h6>
                        <div className="mb-3"><small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">eKYC Identifier</small><span className="fw-bold text-dark">{activeDistributor.kyc_document_type}: {activeDistributor.kyc_id_number || "N/A"}</span></div>
                        <div className="mb-3">
                          <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Verification Status</small>
                          <span className={`badge ${activeDistributor.kyc_status === 'approved' ? 'bg-success' : 'bg-secondary'} rounded-pill text-uppercase`}>
                             {activeDistributor.kyc_status || "Pending Analysis"}
                          </span>
                        </div>
                        <div className="mb-0">
                          <small className="text-muted text-uppercase fw-bold extra-small d-block mb-1">Liveness Protocol</small>
                          <span className={`text-${activeDistributor.kyc_liveness_verified ? 'success' : 'muted'} small fw-bold d-flex align-items-center gap-1`}>
                            {activeDistributor.kyc_liveness_verified ? <RiCheckDoubleLine /> : ""} {activeDistributor.kyc_liveness_verified ? "Verified Secure" : "Awaiting Verification"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Document Artifacts */}
                    <div className="col-12 mt-4">
                      <div className="p-4 border rounded-4 bg-white shadow-sm border-secondary-subtle">
                        <h6 className="fw-bold small text-dark text-uppercase mb-4 ls-wide border-bottom pb-3 d-flex align-items-center gap-2">
                           <RiShieldCheckLine className="text-primary" /> Captured Document Artifacts
                        </h6>
                        <div className="row g-3">
                          {[
                            { label: "Aadhaar Front", url: activeDistributor.address_proof_front },
                            { label: "Aadhaar Back", url: activeDistributor.address_proof_back },
                            { label: "PAN Front", url: activeDistributor.pan_proof_front },
                            { label: "PAN Back", url: activeDistributor.pan_proof_back }
                          ].map((doc, idx) => (
                            <div key={idx} className="col-md-3">
                              <div className="text-center p-2 rounded-3 border bg-light h-100 transition-all hover-shadow">
                                <small className="extra-small fw-bold text-muted text-uppercase mb-2 d-block">{doc.label}</small>
                                {doc.url ? (
                                  <div className="position-relative overflow-hidden rounded-2 border" style={{ height: '120px' }}>
                                    <img src={doc.url} alt={doc.label} className="w-100 h-100 object-fit-cover transition-all" style={{ cursor: 'zoom-in' }} onClick={() => window.open(doc.url, '_blank')} />
                                    <div className="position-absolute bottom-0 start-0 w-100 p-1 bg-dark bg-opacity-50 text-white extra-small fw-bold">Verified Asset</div>
                                  </div>
                                ) : (
                                  <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: '120px', border: '2px dashed #cbd5e1' }}>
                                    <RiCloseLine size={24} className="opacity-25" />
                                    <span className="extra-small opacity-50">Not Captured</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="modal-footer border-top p-3 bg-light">
                <button type="button" className="btn btn-secondary px-4 fw-bold border-0 h-100" onClick={() => setActiveDistributor(null)}>Close Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .extra-small { font-size: 10px; }
        .transition-all { transition: all 0.2s ease; }
        .ls-wide { letter-spacing: 0.1em; }
        .cursor-pointer { cursor: pointer; }
        .border-dashed { border-style: dashed !important; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Enforce Black Font Color for all inputs and selects */
        input, select, textarea, .form-control, .form-select {
          color: #000 !important;
          background-color: #fff !important;
        }
        
        input::placeholder {
          color: #64748b !important;
          opacity: 0.7;
        }
        
        option {
          color: #000 !important;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default RoleManagerUsersSection;
