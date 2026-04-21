import React, { useEffect, useState } from "react";
import {
  RiBankLine,
  RiWallet3Line,
  RiArrowRightUpLine,
  RiCameraLine,
  RiShieldCheckLine,
  RiInformationLine,
  RiAddCircleLine,
  RiShareForwardLine,
  RiHistoryLine,
  RiRestartLine,
  RiBankCardLine,
  RiCheckboxCircleLine,
  RiFingerprintLine,
  RiUser3Line,
  RiPhoneLine,
  RiMailLine,
  RiCalendarEventLine,
  RiHashtag
} from "react-icons/ri";

/* Global overrides for form visibility - Forced Absolute Black */
const FormTextOverride = () => (
  <style>
    {`
      .wallet-form-container input, 
      .wallet-form-container select, 
      .wallet-form-container textarea, 
      .wallet-form-container .form-control, 
      .wallet-form-container .form-select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          font-weight: 600 !important;
      }
      .wallet-form-container select option {
          color: #000000 !important;
          background-color: #ffffff !important;
      }
      .wallet-form-container .input-group-text {
          color: #475569 !important;
          background-color: #f1f5f9 !important;
          font-weight: 700 !important;
      }
      /* Ensure placeholders are visible but distinct */
      .wallet-form-container input::placeholder {
          color: #94a3b8 !important;
          -webkit-text-fill-color: #94a3b8 !important;
          font-weight: 400 !important;
      }
    `}
  </style>
);

/* Shared Style Tokens */
const STYLES = {
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    color: '#000000',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: 'none'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
  }
};

const SavedWithdrawPresetsTable = ({ presets, onApply, formatCurrency }) => {
  if (!presets?.length) return null;

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <RiBankLine className="text-primary" size={20} />
          <h6 className="fw-bold m-0" style={{ color: '#1e293b', fontSize: '15px' }}>Linked Bank Accounts</h6>
        </div>
        <span className="badge bg-light text-muted rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '10px' }}>{presets.length} SAVED</span>
      </div>
      <div className="table-responsive rounded-4 border overflow-hidden shadow-sm bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th className="py-3 px-4 border-0 text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bank Detail</th>
              <th className="py-3 px-3 border-0 text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Holder</th>
              <th className="py-3 px-3 border-0 text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type / Mode</th>
              <th className="py-3 px-4 border-0 text-muted text-end" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((preset, index) => (
              <tr key={`${preset.account_number}-${index}`} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td className="py-3 px-4">
                  <div className="fw-bold text-dark mb-1" style={{ fontSize: '13px' }}>{preset.account_number}</div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: '#64748b' }}>
                    <span className="badge bg-light border-0 p-0 fw-bold" style={{ color: '#64748b' }}>IFSC:</span> {preset.ifsc_code}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="fw-semibold" style={{ fontSize: '13px', color: '#334155' }}>{preset.account_holder_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{preset.beneficiary_mobile}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="d-flex gap-1">
                    <span className="badge bg-light border px-2 py-1" style={{ fontSize: '10px', color: '#475569' }}>{preset.account_type}</span>
                    <span className="badge bg-primary-subtle text-primary border-0 px-2 py-1" style={{ fontSize: '10px' }}>{preset.payment_mode}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-bold rounded-3 px-3 py-1 shadow-none border-0"
                    onClick={() => onApply(preset)}
                    style={{ fontSize: '11px', backgroundColor: '#4f46e5' }}
                  >
                    Use
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HighValueEkycSection = ({ ctx }) => {
  const {
    inlineWithdraw,
    ekycForm,
    handleEkycFieldChange,
    handleEkycFileChange,
    ekycPreview,
    openCamera,
    captureSelfie,
    stopCamera,
    streaming,
    cameraOpen,
    videoRef,
    canvasRef,
    cameraStreamRef,
    handleSubmitEkyc,
    ekycSubmitting,
    profile,
  } = ctx;

  if (Number(inlineWithdraw.amount || 0) < 100000) return null;

  const normalizedKycStatus = String(profile?.kyc_status || "not_submitted").toLowerCase();
  const ekycStatusLabel = normalizedKycStatus === "approved"
    ? "Approved"
    : normalizedKycStatus === "pending"
      ? "Pending Approval"
      : normalizedKycStatus === "rejected"
        ? "Rejected"
        : "Not Submitted";

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStreamRef?.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [cameraOpen, videoRef, cameraStreamRef]);

  return (
    <div className="rounded-4 p-4 mt-5 border border-primary-subtle" style={{ backgroundColor: '#fcfdff' }}>
      <div className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 shadow-sm mb-5 border border-primary-subtle">
        <div className="p-2 bg-primary-subtle text-primary rounded-3 mt-1">
          <RiFingerprintLine size={24} />
        </div>
        <div>
          <div className="text-uppercase fw-bold mb-2" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#4338ca' }}>Step 1 of 2</div>
          <h6 className="fw-bold m-0" style={{ color: '#1e1b4b' }}>Enhanced Security Protocol (Level 2)</h6>
          <p className="m-0 text-muted mt-1" style={{ fontSize: '12px', lineHeight: '1.5' }}>High-threshold transactions trigger mandatory Identity Verification. All data is AES-256 encrypted before transmission.</p>
        </div>
      </div>

      <div className="alert border-0 rounded-4 d-flex align-items-center justify-content-between gap-3 mb-4"
        style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
        <div>
          <div className="fw-bold" style={{ fontSize: '13px' }}>eKYC Status</div>
          <div style={{ fontSize: '12px' }}>
            {normalizedKycStatus === "approved"
              ? "Existing eKYC is already approved. You can review or refresh the details below if needed."
              : normalizedKycStatus === "pending"
                ? "Your latest eKYC is pending admin review. You can still review the submitted details below."
                : "Complete the verification details below and submit them before final withdrawal review."}
          </div>
        </div>
        <div className="px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '11px', backgroundColor: '#ffffff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
          {ekycStatusLabel}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12"><div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.1em' }}><RiUser3Line /> Identity Matrix</div></div>
        <div className="col-md-6">
          <label style={STYLES.label}>First Name *</label>
          <input className="form-control shadow-none" style={STYLES.input} name="first_name" value={ekycForm.first_name} onChange={handleEkycFieldChange} placeholder="First name" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}>Last Name</label>
          <input className="form-control shadow-none" style={STYLES.input} name="last_name" value={ekycForm.last_name} onChange={handleEkycFieldChange} placeholder="Last name" />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiMailLine /> Official Email *</label>
          <input className="form-control shadow-none" type="email" style={STYLES.input} name="email" value={ekycForm.email} onChange={handleEkycFieldChange} placeholder="email@address.com" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiCalendarEventLine /> Date of Birth</label>
          <input className="form-control shadow-none" type="date" style={STYLES.input} name="date_of_birth" value={ekycForm.date_of_birth} onChange={handleEkycFieldChange} />
        </div>

        <div className="col-12 mt-4"><div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.1em' }}><RiBankCardLine /> Sovereign ID Documentation</div></div>
        <div className="col-md-6">
          <label style={STYLES.label}>Document Class</label>
          <select className="form-select shadow-none" style={STYLES.input} name="document_type" value={ekycForm.document_type} onChange={handleEkycFieldChange}>
            <option value="aadhaar">Aadhaar (UIDAI)</option>
            <option value="pan">PAN Card (Income Tax)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiHashtag /> Document Serial *</label>
          <input className="form-control shadow-none" style={STYLES.input} name="kyc_id_number" value={ekycForm.kyc_id_number} onChange={handleEkycFieldChange} placeholder="ID number" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}>Upload Document Front *</label>
          <input
            className="form-control shadow-none"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={STYLES.input}
            onChange={(e) => handleEkycFileChange("document_front", e.target.files?.[0] || null)}
            required={!ekycForm.document_front && !ekycPreview.document_front}
          />
          {(ekycForm.document_front?.name || ekycPreview.document_front) && (
            <div className="mt-2 small fw-semibold" style={{ color: '#475569' }}>
              {ekycForm.document_front?.name || "Front document selected"}
            </div>
          )}
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}>Upload Document Back *</label>
          <input
            className="form-control shadow-none"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={STYLES.input}
            onChange={(e) => handleEkycFileChange("document_back", e.target.files?.[0] || null)}
            required={!ekycForm.document_back && !ekycPreview.document_back}
          />
          {(ekycForm.document_back?.name || ekycPreview.document_back) && (
            <div className="mt-2 small fw-semibold" style={{ color: '#475569' }}>
              {ekycForm.document_back?.name || "Back document selected"}
            </div>
          )}
        </div>
        {(ekycPreview.document_front || ekycPreview.document_back) && (
          <div className="col-12">
            <div className="row g-3">
              {ekycPreview.document_front && (
                <div className="col-md-6">
                  <div className="p-2 bg-white rounded-4 border h-100">
                    <div className="small fw-bold mb-2" style={{ color: '#64748b' }}>Document Front Preview</div>
                    <img src={ekycPreview.document_front} alt="Document front" className="img-fluid rounded-3 border" />
                  </div>
                </div>
              )}
              {ekycPreview.document_back && (
                <div className="col-md-6">
                  <div className="p-2 bg-white rounded-4 border h-100">
                    <div className="small fw-bold mb-2" style={{ color: '#64748b' }}>Document Back Preview</div>
                    <img src={ekycPreview.document_back} alt="Document back" className="img-fluid rounded-3 border" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="col-12">
          <label style={STYLES.label}><RiCameraLine /> Biometric Liveness Capture</label>
          <div className="p-3 bg-white rounded-4 border">
            <div className="d-flex gap-2 flex-wrap mb-3">
              <button
                type="button"
                className="btn btn-dark btn-sm rounded-pill px-4 fw-bold"
                onClick={openCamera}
                style={{ fontSize: '11px', backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #0f172a' }}
              >
                Open Lens
              </button>
              <button type="button" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={captureSelfie} disabled={!streaming} style={{ fontSize: '11px', backgroundColor: '#4f46e5' }}>Capture</button>
              <button type="button" className="btn btn-light btn-sm rounded-pill px-4 fw-bold text-muted" onClick={stopCamera} disabled={!streaming} style={{ fontSize: '11px' }}>Close</button>
            </div>
            {cameraOpen && (
              <div className="rounded-4 border overflow-hidden shadow-sm" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
                <div className="position-relative mx-auto" style={{ maxWidth: '420px' }}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-100 d-block" style={{ height: 300, objectFit: 'cover', backgroundColor: '#020617' }} />
                  <div
                    className="position-absolute top-50 start-50 translate-middle rounded-circle"
                    style={{
                      width: '180px',
                      height: '180px',
                      border: '3px solid rgba(255,255,255,0.95)',
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.35)',
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    className="position-absolute top-50 start-50 translate-middle rounded-circle"
                    style={{
                      width: '150px',
                      height: '150px',
                      border: '1px dashed rgba(255,255,255,0.65)',
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    className="position-absolute start-50 translate-middle-x px-3 py-2 rounded-pill fw-bold"
                    style={{
                      top: '16px',
                      fontSize: '11px',
                      backgroundColor: 'rgba(15, 23, 42, 0.72)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    Align face inside the frame
                  </div>
                </div>
                <canvas ref={canvasRef} className="d-none" />
                <div className="p-3" style={{ backgroundColor: '#ffffff' }}>
                  <div className="small fw-bold text-uppercase mb-2" style={{ color: '#475569', letterSpacing: '0.08em' }}>Instructions</div>
                  <div className="small" style={{ color: '#334155', lineHeight: '1.7' }}>
                    <div>Place your face inside the frame</div>
                    <div>Ensure good lighting</div>
                    <div>Do not wear sunglasses</div>
                  </div>
                </div>
              </div>
            )}
            {ekycForm.liveness_verified && (
              <div className="alert bg-success-subtle text-success border-0 px-3 py-2 rounded-3 mt-3 d-flex align-items-center gap-2 mb-0" style={{ fontSize: '12px' }}>
                <RiCheckboxCircleLine size={18} /> <strong>Validated:</strong> Liveness confirmed via biometric hash
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <button type="button" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow-lg border-0 mt-3"
            onClick={handleSubmitEkyc} disabled={ekycSubmitting} style={{ backgroundColor: '#1e293b', fontSize: '15px' }}>
            {ekycSubmitting ? "Syncing Biometrics..." : "Verify & Authorize Transaction"}
          </button>
          <div className="small mt-2" style={{ color: '#64748b' }}>
            After submit, status will remain pending until reviewed from the existing admin user eKYC screen.
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawForm = ({
  ctx,
  showOtpButton = false,
  hideBalanceInfo = false,
  availableBalanceAmount = null,
  availableBalanceLabel = "Verified Payout Reserve",
  reviewMode = false,
  onOpenReview = null,
}) => {
  const {
    handleInlineWithdrawSubmit,
    formatCurrency,
    mainWallet,
    retailerDashboard,
    inlineWithdraw,
    setInlineWithdraw,
    savedWithdrawPresets,
    handleApplyWithdrawPreset,
    walletActionLoading,
    ekycForm,
    handleRequestWithdrawOtp,
  } = ctx;
  const minimumWithdrawAmount = Number(retailerDashboard?.min_withdraw_amount || 100);
  const displayedAvailableBalance = availableBalanceAmount ?? mainWallet?.balance ?? 0;

  return (
    <form
      className="p-0"
      onSubmit={(e) => {
        if (reviewMode) {
          e.preventDefault();
          return;
        }
        handleInlineWithdrawSubmit(e);
      }}
    >
      {!hideBalanceInfo && (
        <div className="d-flex align-items-center gap-3 p-4 rounded-4 mb-5 border justify-content-between" style={{ backgroundColor: '#fcfdff', borderColor: '#e2e8f0' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-white text-primary rounded-4 shadow-sm border border-primary-subtle">
              <RiWallet3Line size={28} />
            </div>
            <div>
              <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>{availableBalanceLabel}</span>
              <h3 className="m-0 fw-bold" style={{ color: '#1e293b', marginTop: '2px', fontSize: '24px' }}>{formatCurrency(displayedAvailableBalance)}</h3>
            </div>
          </div>
          <div className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '11px' }}>SECURE CHANNEL</div>
        </div>
      )}

      <div className="row g-4 pt-1">
        <div className="col-md-6">
          <label style={STYLES.label}><RiShareForwardLine /> Payment Infrastructure *</label>
          <select className="form-select shadow-none"
            style={STYLES.input}
            value={inlineWithdraw.payment_mode}
            onChange={(e) => setInlineWithdraw((p) => ({ ...p, payment_mode: e.target.value }))}
          >
            <option value="IMPS">IMPS (Real-Time settlement)</option>
            <option value="NEFT">NEFT (Standard Batch)</option>
            <option value="RTGS">RTGS (High-Value Priority)</option>
          </select>
        </div>

        <div className="col-md-6">
          <label style={STYLES.label}>Payout Amount (INR) *</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 px-3 fw-bold text-slate-300" style={{ borderRadius: '12px 0 0 12px', borderColor: '#e2e8f0' }}>₹</span>
            <input type="number"
              className="form-control shadow-none fw-bold"
              style={{ ...STYLES.input, borderRadius: '0 12px 12px 0', borderLeft: '0', fontSize: '16px' }}
              min={minimumWithdrawAmount}
              step="0.01"
              value={inlineWithdraw.amount}
              onChange={(e) => setInlineWithdraw((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <small className="mt-2 d-block fw-semibold text-muted" style={{ fontSize: '10px' }}>Threshold Minimum: ₹{minimumWithdrawAmount}</small>
        </div>

        <div className="col-md-6">
          <label style={STYLES.label}><RiBankCardLine /> Beneficiary Account *</label>
          <input className="form-control shadow-none"
            style={STYLES.input}
            value={inlineWithdraw.account_number}
            onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_number: e.target.value.replace(/\D/g, "") }))}
            placeholder="Recipient A/c number"
            required
          />
        </div>

        <div className="col-md-6">
          <label style={STYLES.label}><RiBankLine /> Bank IFSC Code *</label>
          <input className="form-control shadow-none fw-bold"
            style={{ ...STYLES.input, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            value={inlineWithdraw.ifsc_code}
            onChange={(e) => setInlineWithdraw((p) => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))}
            placeholder="AAAA0000000"
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label style={STYLES.label}><RiUser3Line /> Payee Identity *</label>
          <input className="form-control shadow-none"
            style={STYLES.input}
            value={inlineWithdraw.account_holder_name}
            onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_holder_name: e.target.value }))}
            placeholder="Full Name as per PAN/Aadhaar"
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label style={STYLES.label}><RiPhoneLine /> Verification Mobile *</label>
          <input className="form-control shadow-none"
            style={STYLES.input}
            value={inlineWithdraw.beneficiary_mobile}
            maxLength={10}
            onChange={(e) => setInlineWithdraw((p) => ({ ...p, beneficiary_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
            placeholder="10-digit mobile number"
            required
          />
        </div>
      </div>

      <HighValueEkycSection ctx={ctx} />

      <div className="mt-5 d-flex gap-3">
        <button type="button" className="btn btn-light px-4 py-3 fw-bold rounded-4 border-0"
          onClick={() => setInlineWithdraw((p) => ({ ...p, amount: "" }))}
          style={{ backgroundColor: '#f1f5f9', color: '#64748b', minWidth: '130px' }}>
          <RiRestartLine className="me-2" /> Reset
        </button>
        <button
          type={reviewMode ? "button" : "submit"}
          className="btn btn-primary flex-grow-1 py-3 fw-bold rounded-4 shadow-sm border-0"
          style={{ backgroundColor: '#4f46e5', boxSizing: 'border-box' }}
          disabled={walletActionLoading || (Number(inlineWithdraw.amount || 0) >= 100000 && !ekycForm.kyc_id_number)}
          onClick={(e) => {
            if (!reviewMode || !onOpenReview) return;
            const form = e.currentTarget.form;
            if (form && form.reportValidity()) {
              onOpenReview();
            }
          }}
        >
          {walletActionLoading ? "Syncing..." : reviewMode ? "Continue" : "Process Settlement Now"}
        </button>
      </div>

      {showOtpButton && (
        <div className="mt-3">
          <button type="button" className="btn btn-sm btn-outline-secondary w-100 border-0 fw-bold py-2" onClick={handleRequestWithdrawOtp} style={{ color: '#94a3b8' }}>
            Multi-Factor Auth (OTP Generation)
          </button>
        </div>
      )}

      <SavedWithdrawPresetsTable presets={savedWithdrawPresets} onApply={handleApplyWithdrawPreset} formatCurrency={formatCurrency} />
    </form>
  );
};

const RoleWalletSection = ({ ctx }) => {
  const { role, activeSection, formatCurrency, distributorData, managerData, retailerDashboard, mainWallet, walletActionTab, setWalletActionTab, handleInlineDepositSubmit, handleInlineWithdrawSubmit, inlineDeposit, setInlineDeposit, inlineWithdraw, ekycForm, ekycPreview, walletActionLoading, profile } = ctx;
  const [depositReviewOpen, setDepositReviewOpen] = useState(false);
  const [withdrawReviewOpen, setWithdrawReviewOpen] = useState(false);

  useEffect(() => {
    if (walletActionTab !== "deposit") {
      setDepositReviewOpen(false);
    }
    if (walletActionTab !== "withdraw") {
      setWithdrawReviewOpen(false);
    }
  }, [walletActionTab]);

  useEffect(() => {
    if (!walletActionLoading && !String(inlineDeposit.amount || "").trim()) {
      setDepositReviewOpen(false);
    }
  }, [inlineDeposit.amount, walletActionLoading]);

  useEffect(() => {
    if (!walletActionLoading && !String(inlineWithdraw.amount || "").trim()) {
      setWithdrawReviewOpen(false);
    }
  }, [inlineWithdraw.amount, walletActionLoading]);

  if (activeSection !== "wallet") return null;

  const requiresEkycReview = Number(inlineWithdraw.amount || 0) >= 100000;

  const retailerDepositContent = !depositReviewOpen ? (
    <form className="p-0" onSubmit={(e) => { e.preventDefault(); setDepositReviewOpen(true); }}>
      <div className="alert border-0 rounded-4 mb-5 d-flex align-items-center gap-4 p-4"
        style={{ backgroundColor: '#f0f9ff', color: '#0369a1', borderLeft: '4px solid #0ea5e9 !important' }}>
        <div className="p-3 bg-white rounded-4 shadow-sm border border-light">
          <RiAddCircleLine size={32} style={{ color: '#0ea5e9' }} />
        </div>
        <div>
          <div className="text-uppercase fw-bold mb-2" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>Step 1 of 2</div>
          <h6 className="fw-bold m-0" style={{ fontSize: '16px' }}>Network Deposit Gateway</h6>
          <p className="m-0 mt-1 opacity-80" style={{ fontSize: '13px', lineHeight: '1.5' }}>Initialize a secure top-up via your linked business account. Transactions are processed through IMPS/UPI clearing channels.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <label style={STYLES.label}><RiUser3Line /> Legal Entity Name *</label>
          <input className="form-control shadow-none" style={STYLES.input} value={inlineDeposit.customer_name} onChange={(e) => setInlineDeposit((p) => ({ ...p, customer_name: e.target.value }))} placeholder="Enter full name" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiPhoneLine /> Registry Contact *</label>
          <input className="form-control shadow-none" style={STYLES.input} value={inlineDeposit.mobile} maxLength={10} onChange={(e) => setInlineDeposit((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="+91 XXX-XXX-XXXX" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiMailLine /> Notification Channel *</label>
          <input className="form-control shadow-none" type="email" style={STYLES.input} value={inlineDeposit.email} onChange={(e) => setInlineDeposit((p) => ({ ...p, email: e.target.value }))} placeholder="primary@email.com" required />
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}>Recharge Value (INR) *</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 px-3 fw-bold text-slate-300" style={{ borderRadius: '12px 0 0 12px', borderColor: '#e2e8f0' }}>₹</span>
            <input type="number" className="form-control shadow-none fw-bold" style={{ ...STYLES.input, borderRadius: '0 12px 12px 0', borderLeft: '0', fontSize: '16px' }} min="1" step="0.01" value={inlineDeposit.amount} onChange={(e) => setInlineDeposit((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" required />
          </div>
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}>Operational Category *</label>
          <select className="form-select shadow-none" style={STYLES.input} value={inlineDeposit.category} onChange={(e) => setInlineDeposit((p) => ({ ...p, category: e.target.value }))}>
            <option value="education">Education / Hub Payout</option>
          </select>
        </div>
        <div className="col-md-6">
          <label style={STYLES.label}><RiCalendarEventLine /> Timestamp</label>
          <input className="form-control shadow-none" style={{ ...STYLES.input, backgroundColor: '#f8fafc', color: '#64748b', border: 'none' }} value={inlineDeposit.transaction_date} readOnly />
        </div>
      </div>
      <div className="mt-5 d-flex gap-3">
        <button type="button" className="btn btn-light px-4 py-3 fw-bold rounded-4 border-0" onClick={() => setInlineDeposit((p) => ({ ...p, amount: "" }))} style={{ backgroundColor: '#f1f5f9', color: '#64748b', minWidth: '130px' }}>
          Reset
        </button>
        <button type="submit" className="btn btn-primary flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-3 rounded-4 border-0 shadow-lg" style={{ backgroundColor: '#4f46e5' }} disabled={walletActionLoading}>
          Continue <RiShareForwardLine />
        </button>
      </div>
    </form>
  ) : (
    <div className="p-0">
      <div className="rounded-4 p-4 mb-4" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)', border: '1px solid #dbeafe' }}>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="text-uppercase fw-bold text-primary mb-2" style={{ fontSize: '11px', letterSpacing: '0.12em' }}>Step 2 of 2</div>
            <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Review all deposit details</h5>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: '13px' }}>After you click Pay Now, the retailer will be redirected to the payment gateway.</p>
          </div>
          <div className="px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '11px', backgroundColor: '#ffffff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
            Payment Ready
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Customer Name</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineDeposit.customer_name || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Mobile</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineDeposit.mobile || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Email</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineDeposit.email || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Amount</div>
              <div className="fw-bold" style={{ fontSize: '26px', color: '#1e293b' }}>Rs {Number(inlineDeposit.amount || 0).toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Category</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineDeposit.category || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Wallet</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{mainWallet?.name || "Main Wallet"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3">
        <button
          type="button"
          className="btn btn-light px-4 py-3 fw-bold rounded-4 border"
          onClick={() => setDepositReviewOpen(false)}
          disabled={walletActionLoading}
          style={{ backgroundColor: '#ffffff', color: '#475569', minWidth: '150px' }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-success flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-3 rounded-4 border-0 shadow-lg"
          onClick={handleInlineDepositSubmit}
          disabled={walletActionLoading}
          style={{ backgroundColor: '#16a34a' }}
        >
          {walletActionLoading ? "Redirecting..." : "Pay Now"} <RiShareForwardLine />
        </button>
      </div>
    </div>
  );

  const retailerWithdrawContent = !withdrawReviewOpen ? (
    <WithdrawForm ctx={ctx} showOtpButton reviewMode onOpenReview={() => setWithdrawReviewOpen(true)} />
  ) : (
    <div className="p-0">
      <div className="rounded-4 p-4 mb-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid #dbeafe' }}>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="text-uppercase fw-bold mb-2" style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#4338ca' }}>Step 2 of 2</div>
            <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Review all withdrawal details</h5>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: '13px' }}>Please verify payout details before submitting the withdrawal request.</p>
          </div>
          <div className="px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '11px', backgroundColor: '#ffffff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
            Withdrawal Ready
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Payment Mode</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineWithdraw.payment_mode || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Amount</div>
              <div className="fw-bold" style={{ fontSize: '26px', color: '#1e293b' }}>Rs {Number(inlineWithdraw.amount || 0).toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Beneficiary Account</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineWithdraw.account_number || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>IFSC Code</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineWithdraw.ifsc_code || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Account Holder</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineWithdraw.account_holder_name || "--"}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 border p-3 h-100" style={{ borderColor: '#dbe2ea' }}>
              <div className="small mb-1" style={{ color: '#64748b' }}>Verification Mobile</div>
              <div className="fw-semibold" style={{ color: '#0f172a' }}>{inlineWithdraw.beneficiary_mobile || "--"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-4 p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div>
              <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#475569' }}>Verification Summary</div>
              <h6 className="fw-bold m-0" style={{ color: '#1e293b' }}>Verified details and captured image</h6>
            </div>
            <div className={`px-3 py-2 rounded-pill fw-bold ${requiresEkycReview ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`} style={{ fontSize: '11px' }}>
              {requiresEkycReview ? (ekycForm.liveness_verified ? 'Verification Captured' : 'Verification Pending') : 'Verification Not Required'}
            </div>
          </div>

          {requiresEkycReview ? (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-1" style={{ color: '#64748b' }}>Name</div>
                  <div className="fw-semibold" style={{ color: '#0f172a' }}>{[ekycForm.first_name, ekycForm.last_name].filter(Boolean).join(" ") || "--"}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-1" style={{ color: '#64748b' }}>Email</div>
                  <div className="fw-semibold" style={{ color: '#0f172a' }}>{ekycForm.email || "--"}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-1" style={{ color: '#64748b' }}>Document Type</div>
                  <div className="fw-semibold text-capitalize" style={{ color: '#0f172a' }}>{ekycForm.document_type || "--"}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-1" style={{ color: '#64748b' }}>Document Serial</div>
                  <div className="fw-semibold" style={{ color: '#0f172a' }}>{ekycForm.kyc_id_number || "--"}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-2" style={{ color: '#64748b' }}>Document Front</div>
                  {ekycPreview.document_front ? (
                    <img src={ekycPreview.document_front} alt="Document front" className="img-fluid rounded-3 border" />
                  ) : (
                    <div className="small fw-semibold" style={{ color: '#94a3b8' }}>Not uploaded</div>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-2" style={{ color: '#64748b' }}>Document Back</div>
                  {ekycPreview.document_back ? (
                    <img src={ekycPreview.document_back} alt="Document back" className="img-fluid rounded-3 border" />
                  ) : (
                    <div className="small fw-semibold" style={{ color: '#94a3b8' }}>Not uploaded</div>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded-4 border p-3 h-100">
                  <div className="small mb-2" style={{ color: '#64748b' }}>Captured Selfie</div>
                  {ekycPreview.selfie_photo ? (
                    <img src={ekycPreview.selfie_photo} alt="Captured selfie" className="img-fluid rounded-3 border" />
                  ) : (
                    <div className="small fw-semibold" style={{ color: '#94a3b8' }}>Not captured</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="small fw-semibold" style={{ color: '#64748b' }}>
              This withdrawal amount does not require additional eKYC verification.
            </div>
          )}
          {requiresEkycReview && (
            <div className="small mt-3" style={{ color: '#64748b' }}>
              Current eKYC status: <strong style={{ color: '#334155' }}>{String(profile?.kyc_status || "pending").replace(/_/g, " ")}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-3">
        <button
          type="button"
          className="btn btn-light px-4 py-3 fw-bold rounded-4 border"
          onClick={() => setWithdrawReviewOpen(false)}
          disabled={walletActionLoading}
          style={{ backgroundColor: '#ffffff', color: '#475569', minWidth: '150px' }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-success flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-3 rounded-4 border-0 shadow-lg"
          onClick={handleInlineWithdrawSubmit}
          disabled={walletActionLoading || (requiresEkycReview && !ekycForm.liveness_verified)}
          style={{ backgroundColor: '#16a34a' }}
        >
          {walletActionLoading ? "Processing..." : "Withdraw Now"} <RiShareForwardLine />
        </button>
      </div>
    </div>
  );

  // Distributor UI (Management View)
  if (role === "distributor") {
    const distributorCommissionAvailable = distributorData?.commission_available ?? distributorData?.commission_earned ?? 0;
    return (
      <div className="px-4 pb-5 wallet-form-container">
        <FormTextOverride />
        <section className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5 mt-2" style={{ backgroundColor: '#1e293b' }}>
          <div className="card-body p-5 d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <span className="opacity-60 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#fff' }}>Treasury Infrastructure</span>
              <h2 className="text-white fw-bold m-0 mt-2" style={{ fontSize: '32px' }}>Liquidity Portal</h2>
              <p className="text-white-50 m-0 mt-3 fw-medium" style={{ maxWidth: '450px', fontSize: '14px', lineHeight: '1.7' }}>Request a secure payout from your accrued commission network into your verified settlement bank account.</p>
            </div>
            <div className="text-end bg-white/5 p-4 rounded-4 border border-white/10" style={{ minWidth: '300px' }}>
              <span className="text-primary d-block mb-2 small fw-bold text-uppercase" style={{ letterSpacing: '0.08em', color: '#818cf8 !important' }}>Aggregated Earnings</span>
              <h1 className="text-white fw-bold m-0" style={{ fontSize: '40px' }}>{formatCurrency(distributorData?.commission_earned)}</h1>
              <div className="d-flex align-items-center justify-content-end gap-2 mt-3 p-2 bg-white/5 rounded-3">
                <span className="text-white-50 small fw-bold">Settlement Cap:</span>
                <strong className="text-white">{formatCurrency(distributorCommissionAvailable)}</strong>
              </div>
            </div>
          </div>
        </section>

        <div className="row g-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100" style={STYLES.card}>
              <div className="card-header bg-transparent border-0 p-5 pb-0">
                <h5 className="fw-bold m-0" style={{ color: '#1e293b', fontSize: '20px' }}>Settlement Terminal</h5>
                <div className="mt-2 text-muted small">Electronic Fund Transfer Interface</div>
              </div>
              <div className="card-body p-5 pt-3">
                <WithdrawForm ctx={ctx} availableBalanceAmount={distributorCommissionAvailable} availableBalanceLabel="Withdrawable Liquidity" />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100" style={STYLES.card}>
              <div className="card-header bg-transparent border-0 p-5 pb-0">
                <h5 className="fw-bold m-0" style={{ color: '#1e293b', fontSize: '20px' }}>Vault Ledger</h5>
              </div>
              <div className="card-body p-5">
                <div className="d-flex flex-column gap-5">
                  {[
                    { label: 'Active Royalty', val: distributorData?.commission_earned, color: '#4f46e5', icon: RiWallet3Line },
                    { label: 'Network Matrix', val: `${distributorData?.total_retailers || 0} Entities`, color: '#64748b', icon: RiBankLine },
                    { label: '7-Day Settlement', val: distributorData?.weekly_withdraw ?? 0, color: '#10b981', icon: RiArrowRightUpLine }
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-4">
                      <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon style={{ color: item.color }} size={24} />
                      </div>
                      <div>
                        <span className="text-slate-400 d-block fw-bold text-uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.12em' }}>{item.label}</span>
                        <h5 className="m-0 fw-bold" style={{ fontSize: '18px', color: '#1e293b' }}>
                          {typeof item.val === 'number' ? formatCurrency(item.val) : item.val}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Master/Super UI (Executive Panel)
  if (role === "master_distributor" || role === "super_distributor") {
    const managerCommissionAvailable = managerData?.commission_available ?? managerData?.commission_earned ?? 0;
    return (
      <div className="px-4 pb-5 wallet-form-container">
        <FormTextOverride />
        <div className="card border-0 shadow-sm rounded-4 mb-5 mt-2" style={STYLES.card}>
          <div className="card-body p-5 d-flex align-items-center justify-content-between border-start border-5 border-primary rounded-start-4">
            <div className="d-flex align-items-center gap-4">
              <div className="p-4 bg-primary text-white rounded-4 shadow-lg">
                <RiShieldCheckLine size={32} />
              </div>
              <div>
                <h4 className="fw-bold m-0" style={{ color: '#1e293b' }}>Executive Royalty Center</h4>
                <p className="text-muted m-0 mt-1 fw-medium">Protocol-level liquidity management and payout control</p>
              </div>
            </div>
            <div className="text-end">
              <span className="text-slate-400 small d-block mb-1 fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Total System Royalty</span>
              <h2 className="fw-bold m-0 text-primary" style={{ fontSize: '38px' }}>{formatCurrency(managerData?.commission_earned)}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4" style={STYLES.card}>
          <div className="card-body p-5">
            <WithdrawForm ctx={ctx} hideBalanceInfo availableBalanceAmount={managerCommissionAvailable} availableBalanceLabel="Withdrawable Assets" />
          </div>
        </div>
      </div>
    );
  }

  if (role !== "retailer") return null;

  // Retailer UI (Standard User Panel)
  return (
    <div className="px-4 pb-5 wallet-form-container">
      <FormTextOverride />
      <section className="row g-4 mb-5 mt-2">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={STYLES.card}>
            <div className="card-body p-5">
              <div className="d-flex align-items-center gap-4">
                <div className="p-4 bg-primary-subtle text-primary rounded-4 border border-primary-subtle shadow-sm">
                  <RiWallet3Line size={32} />
                </div>
                <div>
                  <span className="text-slate-400 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>Available Working Capital</span>
                  <h1 className="fw-bold m-0 mt-2" style={{ color: '#1e293b', fontSize: '36px' }}>{formatCurrency(retailerDashboard?.wallet_balance || mainWallet?.balance)}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
            style={{ ...STYLES.card, backgroundColor: '#1e293b', borderColor: '#1e293b' }}>
            <div className="card-body p-5 text-white position-relative z-1">
              <span className="opacity-60 small fw-bold text-uppercase" style={{ letterSpacing: '0.15em' }}>Verified Hub Registry</span>
              <div className="d-flex align-items-baseline mb-3 mt-2">
                <h1 className="fw-bold m-0" style={{ fontSize: '40px' }}>{formatCurrency(mainWallet?.balance || 0)}</h1>
                <RiCheckboxCircleLine className="ms-2 opacity-60 text-success" size={24} />
              </div>
              <div className="d-flex gap-2">
                <div className="px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}>PCIDSS READY</div>
                <div className="px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}>BANK-API SYNCED</div>
              </div>
            </div>
            <RiWallet3Line className="position-absolute end-0 bottom-0 opacity-10" size={200} style={{ transform: 'translate(15%, 15%)' }} />
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-4 overflow-hidden" style={STYLES.card}>
        <div className="card-header bg-white border-0 p-5 pb-0 d-flex flex-wrap justify-content-between align-items-center gap-4">
          <div>
            <h4 className="fw-bold m-0" style={{ color: '#1e293b' }}>Treasury Operations</h4>
            <p className="text-muted small mt-2 mb-0 fw-medium">Execute secure digital transactions via primary settlement gateways</p>
          </div>
          <div className="p-1 bg-light border rounded-pill d-flex">
            <button
              className={`btn btn-sm px-5 py-2 fw-bold border-0 rounded-pill transition-all ${walletActionTab === 'deposit' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setWalletActionTab("deposit")}
              style={{ fontSize: '13px' }}
            >
              Deposit Assets
            </button>
            <button
              className={`btn btn-sm px-5 py-2 fw-bold border-0 rounded-pill transition-all ${walletActionTab === 'withdraw' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setWalletActionTab("withdraw")}
              style={{ fontSize: '13px' }}
            >
              Settle Payout
            </button>
          </div>
        </div>

        <div className="card-body p-5 pt-4">
          {walletActionTab === "deposit" ? retailerDepositContent : retailerWithdrawContent}
        </div>
      </section>
    </div>
  );
};

export default RoleWalletSection;
