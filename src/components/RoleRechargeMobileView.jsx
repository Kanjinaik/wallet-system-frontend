import React from "react";
import { toast } from "react-toastify";
import { 
  RiSmartphoneLine, 
  RiSearchLine, 
  RiPriceTag3Line,
  RiCheckDoubleLine,
  RiExchangeLine,
  RiShieldCheckLine
} from "react-icons/ri";
import RoleRechargeQuickAmounts from "./RoleRechargeQuickAmounts";

const RoleRechargeMobileView = ({ ctx }) => {
  const {
    handleRechargeSubmit,
    rechargeType,
    setRechargeType,
    rechargeMobile,
    setRechargeMobile,
    rechargeCircle,
    setRechargeCircle,
    INDIA_STATES,
    rechargeOperator,
    rechargeOperatorSearch,
    setRechargeOperatorSearch,
    rechargeAmount,
    setRechargeAmount,
    RECHARGE_OPERATORS,
    RECHARGE_QUICK_AMOUNTS,
    filteredRechargeOperators,
    selectedMobilePlanSuggestions,
    setRechargeOperator,
    formatCurrency
  } = ctx;

  const currentOp = RECHARGE_OPERATORS.find(op => op.key === rechargeOperator);

  return (
    <div className="row g-4 animate-fade-in">
      {/* Transaction Configuration Card */}
      <div className="col-lg-5">
        <div className="p-4 rounded-4 border bg-light bg-opacity-10 h-100 shadow-sm border-secondary-subtle">
          <div className="d-flex align-items-center gap-2 mb-4">
             <RiSmartphoneLine className="text-primary" size={20} />
             <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">Protocol Configuration</h6>
          </div>

          <form onSubmit={handleRechargeSubmit}>
            <div className="mb-4">
              <label className="form-label extra-small fw-bold text-muted text-uppercase d-block mb-3">Service Type</label>
              <div className="d-flex align-items-center gap-2 px-3 py-3 rounded-4 border bg-light">
                <RiShieldCheckLine className="text-success" size={18} />
                <div>
                  <div className="fw-bold text-dark">Mobile Prepaid</div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>
                    BBPS and postpaid are disabled. Live PayU prepaid only.
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-4 border border-success-subtle bg-success-subtle text-success">
                <RiCheckDoubleLine size={18} />
                <div>
                  <div className="fw-bold" style={{ fontSize: "12px" }}>Realtime Recharge Active</div>
                  <div style={{ fontSize: "11px" }}>
                    Wallet balance is used for instant live prepaid settlement.
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Node Identifier */}
            <div className="mb-3">
              <label className="form-label extra-small fw-bold text-muted text-uppercase">Mobile Node Identifier *</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0 text-muted"><small className="fw-bold">+91</small></span>
                <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={rechargeMobile} maxLength={10} onChange={(e) => setRechargeMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="00000 00000" required />
              </div>
            </div>

            {/* Regional Hub & Operator */}
            <div className="row g-3 mb-3">
               <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase">Regional Hub *</label>
                  <select className="form-select border-secondary-subtle fw-bold" value={rechargeCircle} onChange={(e) => setRechargeCircle(e.target.value)} required>
                    {INDIA_STATES.map((state) => (<option key={state} value={state}>{state}</option>))}
                  </select>
               </div>
               <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase">Operator Hub *</label>
                  <div className="input-group">
                     <span className="input-group-text bg-light">{currentOp ? <span className={`badge rounded-circle p-1`} style={{backgroundColor: currentOp.color}}>{currentOp.mark}</span> : <RiExchangeLine/>}</span>
                     <input className="form-control border-secondary-subtle fw-bold bg-white" value={rechargeOperator || "Select Hub"} readOnly required />
                  </div>
               </div>
            </div>

            {/* Transaction Quantum */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                 <label className="form-label extra-small fw-bold text-muted text-uppercase m-0">Transaction Quantum *</label>
                 <button type="button" className="btn btn-link p-0 extra-small fw-bold text-primary text-decoration-none" onClick={() => toast.info(`Fetching plans for ${rechargeOperator || "all hubs"}...`)}>Query Plans</button>
              </div>
              <div className="input-group input-group-lg mb-3">
                <span className="input-group-text bg-white border-end-0 text-muted"><RiPriceTag3Line/></span>
                <input type="number" min="1" step="1" className="form-control border-start-0 fw-bold border-secondary-subtle" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} placeholder="0.00" required title="Amount" />
              </div>
              <RoleRechargeQuickAmounts
                amounts={RECHARGE_QUICK_AMOUNTS}
                selectedAmount={rechargeAmount}
                onSelect={setRechargeAmount}
                formatCurrency={formatCurrency}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3" style={{ backgroundColor: '#4f46e5' }}>
              Confirm Settlement <RiCheckDoubleLine size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Operator & Plan Repository */}
      <div className="col-lg-7">
         <div className="p-4 rounded-4 border bg-white h-100 shadow-sm border-secondary-subtle overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
               <div className="d-flex align-items-center gap-2">
                  <RiSearchLine className="text-secondary" />
                  <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">Operator Repository</h6>
               </div>
               <div className="position-relative">
                  <RiSearchLine className="position-absolute translate-middle-y translate-middle-x" style={{ left: '15px', top: '50%', fontSize: '12px' }} />
                  <input className="form-control form-control-sm ps-4 border-secondary-subtle rounded-pill bg-light" placeholder="Search network..." style={{ width: '200px' }} value={rechargeOperatorSearch} onChange={(e) => setRechargeOperatorSearch(e.target.value)} />
               </div>
            </div>

            <div className="row g-2 mb-4 scrollbar-hidden overflow-auto" style={{ maxHeight: '180px' }}>
               {filteredRechargeOperators.map((operator) => (
                 <div key={operator.key} className="col-md-4">
                    <button type="button" className={`btn w-100 h-100 p-3 rounded-4 border transition-all text-start d-flex align-items-center gap-3 ${rechargeOperator === operator.key ? 'border-primary bg-primary bg-opacity-10' : 'bg-light hover-bg-light border-secondary-subtle'}`} onClick={() => setRechargeOperator(operator.key)}>
                       <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold border" style={{ width: '40px', height: '40px', backgroundColor: operator.color, color: operator.textColor, fontSize: '14px' }}>
                          {operator.mark}
                       </div>
                       <div>
                          <div className="fw-bold text-dark extra-small lh-1 mb-1">{operator.title}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>Network Hub</div>
                       </div>
                    </button>
                 </div>
               ))}
            </div>

            <div className="border-top pt-4">
               <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide mb-3">Protocol Plan Gallery</h6>
               <div className="row g-3 overflow-auto scrollbar-hidden" style={{ maxHeight: '300px' }}>
                  {selectedMobilePlanSuggestions.map((plan, i) => (
                    <div key={i} className="col-md-6">
                       <button type="button" className="btn w-100 p-3 rounded-4 border bg-white text-start transition-all hover-shadow border-secondary-subtle border-opacity-50" onClick={() => setRechargeAmount(String(plan.amount))}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                             <strong className="h5 fw-bold text-primary m-0">{formatCurrency ? formatCurrency(plan.amount) : `Rs ${plan.amount}`}</strong>
                             <span className="badge bg-light text-muted border py-1 px-2 rounded-pill extra-small fw-bold">{plan.validity}</span>
                          </div>
                          <p className="text-muted small m-0 mb-1 fw-medium lh-sm" style={{ fontSize: '11px' }}>{plan.benefits}</p>
                          <div className="extra-small text-uppercase fw-bold text-success opacity-75">Instant settlement</div>
                       </button>
                    </div>
                  ))}
                  {selectedMobilePlanSuggestions.length === 0 && (
                    <div className="text-center py-5 opacity-50">
                       <RiPriceTag3Line size={48} className="mb-3" />
                       <div className="fw-bold small">Select an Operator to observe active plans</div>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default RoleRechargeMobileView;
