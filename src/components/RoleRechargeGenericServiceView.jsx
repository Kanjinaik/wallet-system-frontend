import React from "react";
import {
  RiTrainLine, 
  RiWifiLine, 
  RiBookOpenLine, 
  RiShieldLine, 
  RiBankCard2Line, 
  RiSearchLine,
  RiCheckDoubleLine,
  RiInformationLine,
  RiExchangeLine,
  RiNumbersLine,
  RiSmartphoneLine
} from "react-icons/ri";
import RoleRechargeQuickAmounts from "./RoleRechargeQuickAmounts";

const CONFIG = {
  metro: {
    title: "Recharge Metro Card",
    searchLabel: "Search Metro Operator",
    searchPlaceholder: "Search metro operator",
    providerLabel: "Metro Operator",
    idLabel: "Metro Card Number",
    idPlaceholder: "Enter metro smart card number",
    amountLabel: "Amount",
    submitLabel: "Proceed to Recharge",
    note: "Step flow: Select metro operator -> enter card number -> choose amount -> proceed.",
    panelTitle: "Select Metro Operator",
    quickAmounts: true,
    icon: <RiTrainLine size={24} />,
    color: "#0ea5e9"
  },
  broadband: {
    title: "Pay Broadband Bill",
    searchLabel: "Search Provider",
    searchPlaceholder: "Search broadband provider",
    providerLabel: "Provider",
    idLabel: "Customer ID / Landline Number",
    idPlaceholder: "Enter customer id or landline number",
    extraLabel: "Mobile Number (Optional)",
    extraPlaceholder: "Enter 10-digit mobile number",
    amountLabel: "Amount",
    submitLabel: "Proceed to Pay Bill",
    note: "Step flow: Select provider -> enter customer ID -> enter amount -> proceed.",
    panelTitle: "Select Broadband Provider",
    extraMax: 10,
    extraNumeric: true,
    icon: <RiWifiLine size={24} />,
    color: "#6366f1"
  },
  education: {
    title: "Pay Education Fees",
    searchLabel: "Search Category",
    searchPlaceholder: "Search institute category",
    providerLabel: "Category",
    idLabel: "Student ID / Enrollment Number",
    idPlaceholder: "Enter student id",
    amountLabel: "Fee Amount",
    submitLabel: "Proceed to Pay Fee",
    note: "Step flow: Select category -> enter student ID -> enter fee amount -> proceed.",
    panelTitle: "Select Education Category",
    icon: <RiBookOpenLine size={24} />,
    color: "#8b5cf6"
  },
  insurance: {
    title: "Pay Insurance Premium",
    searchLabel: "Search Insurer",
    searchPlaceholder: "Search insurance provider",
    providerLabel: "Insurance Provider",
    idLabel: "Policy Number",
    idPlaceholder: "Enter policy number",
    extraLabel: "Mobile Number (Optional)",
    extraPlaceholder: "Enter 10-digit mobile number",
    amountLabel: "Premium Amount",
    submitLabel: "Proceed to Pay Premium",
    note: "Step flow: Select insurer -> enter policy number -> enter premium amount -> proceed.",
    panelTitle: "Select Insurance Provider",
    extraMax: 10,
    extraNumeric: true,
    icon: <RiShieldLine size={24} />,
    color: "#f43f5e"
  },
  "pay-loan": {
    title: "Pay Loan EMI",
    searchLabel: "Search Lender",
    searchPlaceholder: "Search loan provider",
    providerLabel: "Loan Provider",
    idLabel: "Loan Account Number",
    idPlaceholder: "Enter loan account number",
    amountLabel: "EMI Amount",
    submitLabel: "Proceed to Pay EMI",
    note: "Step flow: Select lender -> enter loan account number -> enter EMI amount -> proceed.",
    panelTitle: "Select Loan Provider",
    icon: <RiBankCard2Line size={24} />,
    color: "#10b981"
  },
};

const RoleRechargeGenericServiceView = ({ serviceKey, ctx }) => {
  const config = CONFIG[serviceKey];
  const {
    handleRechargeSubmit,
    rechargeOperatorSearch,
    setRechargeOperatorSearch,
    filteredRechargeOperators,
    RECHARGE_QUICK_AMOUNTS,
    formatCurrency
  } = ctx;

  const stateMap = {
    metro: [ctx.metroOperator, ctx.setMetroOperator, ctx.metroCardNumber, ctx.setMetroCardNumber, ctx.metroAmount, ctx.setMetroAmount, "", null],
    broadband: [ctx.broadbandProvider, ctx.setBroadbandProvider, ctx.broadbandAccountId, ctx.setBroadbandAccountId, ctx.broadbandAmount, ctx.setBroadbandAmount, ctx.broadbandMobile, ctx.setBroadbandMobile],
    education: [ctx.educationInstitute, ctx.setEducationInstitute, ctx.educationStudentId, ctx.setEducationStudentId, ctx.educationAmount, ctx.setEducationAmount, "", null],
    insurance: [ctx.insuranceProvider, ctx.setInsuranceProvider, ctx.insurancePolicyNumber, ctx.setInsurancePolicyNumber, ctx.insuranceAmount, ctx.setInsuranceAmount, ctx.insuranceMobile, ctx.setInsuranceMobile],
    "pay-loan": [ctx.loanProvider, ctx.setLoanProvider, ctx.loanAccountNumber, ctx.setLoanAccountNumber, ctx.loanAmount, ctx.setLoanAmount, "", null],
  };

  const [providerValue, setProviderValue, idValue, setIdValue, amountValue, setAmountValue, extraValue, setExtraValue] = stateMap[serviceKey];

  return (
    <div className="row g-4 animate-fade-in">
       {/* Settlement Hub */}
       <div className="col-lg-5">
         <div className="p-4 rounded-4 border bg-light bg-opacity-10 shadow-sm border-secondary-subtle">
           <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-2" style={{ color: config.color }}>
                 {config.icon}
                 <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">Protocol: {config.title}</h6>
              </div>
              <div className="badge bg-light text-muted border px-2 py-1 rounded-pill extra-small fw-bold">PAYU SECURE</div>
           </div>

           <form onSubmit={handleRechargeSubmit}>
              {/* Provider Status */}
              <div className="mb-4">
                 <label className="form-label extra-small fw-bold text-muted text-uppercase d-block mb-2">{config.providerLabel} Hub *</label>
                 <div className="p-3 rounded-4 bg-white border border-secondary-subtle d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px', color: config.color }}>
                       {providerValue ? <RiCheckDoubleLine size={20} /> : <RiExchangeLine size={20} className="opacity-25" />}
                    </div>
                    <div>
                       <div className="fw-bold text-dark small">{providerValue || "Awaiting Selection"}</div>
                       <div className="extra-small text-muted">Service Verification Node</div>
                    </div>
                 </div>
              </div>

              {/* Primary Identifier */}
              <div className="mb-3">
                 <label className="form-label extra-small fw-bold text-muted text-uppercase">{config.idLabel} *</label>
                 <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiNumbersLine size={18}/></span>
                    <input className="form-control border-start-0 fw-bold border-secondary-subtle bg-white" value={idValue} onChange={(e) => setIdValue(e.target.value)} placeholder={config.idPlaceholder} required />
                 </div>
              </div>

              {/* Optional Secondary Identifier */}
              {setExtraValue && (
                 <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase">{config.extraLabel}</label>
                    <div className="input-group">
                       <span className="input-group-text bg-white border-end-0 text-muted"><RiSmartphoneLine size={18}/></span>
                       <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={extraValue} maxLength={config.extraMax} onChange={(e) => setExtraValue(config.extraNumeric ? e.target.value.replace(/\D/g, "").slice(0, config.extraMax) : e.target.value)} placeholder={config.extraPlaceholder} />
                    </div>
                 </div>
              )}

              {/* Transaction Quantum */}
              <div className="mb-4 pt-2 border-top">
                 <label className="form-label extra-small fw-bold text-muted text-uppercase">{config.amountLabel} *</label>
                 <div className="input-group input-group-lg mb-3 shadow-sm rounded-3 overflow-hidden">
                    <span className="input-group-text bg-white border-end-0 text-muted ps-3 pe-2 fw-medium">₹</span>
                    <input type="number" min="1" step="1" className="form-control border-start-0 fw-bold border-secondary-subtle" value={amountValue} onChange={(e) => setAmountValue(e.target.value)} placeholder="0.00" required />
                 </div>

                 {config.quickAmounts && (
                   <RoleRechargeQuickAmounts
                     amounts={RECHARGE_QUICK_AMOUNTS}
                     selectedAmount={amountValue}
                     onSelect={setAmountValue}
                     formatCurrency={formatCurrency}
                   />
                 )}
              </div>

              <div className="alert bg-success bg-opacity-10 border-0 text-success p-3 rounded-3 mb-4 d-flex gap-3 align-items-center">
                 <RiInformationLine size={20} className="flex-shrink-0" />
                 <span className="extra-small fw-medium opacity-75">{config.note}</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3" style={{ backgroundColor: '#4f46e5' }}>
                {config.submitLabel} <RiCheckDoubleLine size={24} />
              </button>
           </form>
         </div>
       </div>

       {/* Provider Repository */}
       <div className="col-lg-7">
          <div className="p-4 rounded-4 border bg-white h-100 shadow-sm border-secondary-subtle">
             <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                   <RiSearchLine className="text-secondary" />
                   <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">{config.panelTitle}</h6>
                </div>
                <div className="position-relative">
                   <RiSearchLine className="position-absolute translate-middle-y translate-middle-x" style={{ left: '15px', top: '50%', fontSize: '12px' }} />
                   <input className="form-control form-control-sm ps-4 border-secondary-subtle rounded-pill bg-light" placeholder="Filter hub..." style={{ width: '200px' }} value={rechargeOperatorSearch} onChange={(e) => setRechargeOperatorSearch(e.target.value)} />
                </div>
             </div>

             <div className="row g-3 overflow-auto scrollbar-hidden" style={{ maxHeight: '500px' }}>
                {filteredRechargeOperators.map((operator) => (
                   <div key={operator.key} className="col-md-6 col-xl-4">
                      <button type="button" className={`btn w-100 h-100 p-3 rounded-4 border transition-all text-start d-flex align-items-center gap-3 ${providerValue === operator.key ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-light hover-bg-light border-secondary-subtle'}`} onClick={() => setProviderValue(operator.key)}>
                         <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold border" style={{ width: '40px', height: '40px', backgroundColor: operator.color || '#f1f5f9', color: operator.textColor || '#475569', fontSize: '14px' }}>
                            {operator.mark || operator.title.charAt(0)}
                         </div>
                         <div className="overflow-hidden">
                            <div className="fw-bold text-dark extra-small lh-1 mb-1 text-truncate">{operator.title}</div>
                            <div className="text-muted extra-small opacity-75">Service Unit</div>
                         </div>
                      </button>
                   </div>
                ))}
                {filteredRechargeOperators.length === 0 && (
                   <div className="col-12 text-center py-5 opacity-50">
                      <RiSearchLine size={48} className="mb-3" />
                      <div className="fw-bold small">No service hubs discovered in this region</div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default RoleRechargeGenericServiceView;
