import React from "react";
import { 
  RiTvLine, 
  RiSearchLine, 
  RiUser3Line, 
  RiMoneyDollarCircleLine,
  RiCheckDoubleLine,
  RiShieldFlashLine
} from "react-icons/ri";
import RoleRechargeQuickAmounts from "./RoleRechargeQuickAmounts";

const RoleRechargeDthView = ({ ctx }) => {
  const {
    handleRechargeSubmit,
    rechargeOperatorSearch,
    setRechargeOperatorSearch,
    dthOperator,
    setDthOperator,
    DTH_OPERATORS,
    dthSubscriberId,
    setDthSubscriberId,
    RECHARGE_QUICK_AMOUNTS,
    rechargeAmount,
    setRechargeAmount,
    filteredRechargeOperators,
    formatCurrency
  } = ctx;

  const currentOp = DTH_OPERATORS.find(op => op.key === dthOperator);

  return (
    <div className="row g-4 animate-fade-in">
      {/* DTH Transaction Form */}
      <div className="col-lg-5">
        <div className="p-4 rounded-4 border bg-light bg-opacity-10 h-100 shadow-sm border-secondary-subtle">
          <div className="d-flex align-items-center gap-2 mb-4 text-primary">
             <RiTvLine size={20} />
             <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">DTH Protocol Configuration</h6>
          </div>

          <form onSubmit={handleRechargeSubmit}>
             {/* Subscriber Identity */}
             <div className="mb-3">
                <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1">Subscriber ID / Mobile *</label>
                <div className="input-group input-group-lg">
                   <span className="input-group-text bg-white border-end-0 text-muted"><RiUser3Line/></span>
                   <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={dthSubscriberId} onChange={(e) => setDthSubscriberId(e.target.value)} placeholder="Enter Subscriber ID" required />
                </div>
                <small className="text-muted extra-small mt-1 d-block opacity-75">Verification will be performed before settlement</small>
             </div>

             {/* Operator Selection Telemetry */}
             <div className="mb-3">
                <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1">Operator Hub *</label>
                <div className="p-3 rounded-3 bg-white border border-secondary-subtle d-flex align-items-center justify-content-between">
                   <div className="d-flex align-items-center gap-3">
                      {currentOp ? (
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold border" style={{ width: '40px', height: '40px', backgroundColor: currentOp.color, color: currentOp.textColor }}>
                           {currentOp.mark}
                        </div>
                      ) : (
                        <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                           <RiTvLine className="opacity-25" />
                        </div>
                      )}
                      <div>
                        <div className="fw-bold text-dark small">{dthOperator || "Select Network"}</div>
                        <div className="extra-small text-muted">Awaiting Hub Link</div>
                      </div>
                   </div>
                   <RiShieldFlashLine className={currentOp ? "text-success" : "text-muted opacity-25"} />
                </div>
             </div>

             {/* Transaction Quantum */}
             <div className="mb-4">
                <label className="form-label extra-small fw-bold text-muted text-uppercase">Transaction Quantum *</label>
                <div className="input-group input-group-lg mb-3">
                   <span className="input-group-text bg-white border-end-0 text-muted"><RiMoneyDollarCircleLine/></span>
                   <input type="number" min="1" step="1" className="form-control border-start-0 fw-bold border-secondary-subtle" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <RoleRechargeQuickAmounts
                  amounts={RECHARGE_QUICK_AMOUNTS}
                  selectedAmount={rechargeAmount}
                  onSelect={setRechargeAmount}
                  formatCurrency={formatCurrency}
                  buttonKeyPrefix="dth-q"
                  className="d-flex flex-wrap gap-1"
                />
             </div>

             <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3" style={{ backgroundColor: '#4f46e5' }}>
               Initiate DTH Settlement <RiCheckDoubleLine size={20} />
             </button>

             <div className="mt-4 text-center">
                <div className="badge bg-light text-muted border px-3 py-2 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-2">
                   <span className="text-primary fw-bold" style={{ fontSize: '10px' }}>PAYU</span> Secured Recharge
                </div>
             </div>
          </form>
        </div>
      </div>

      {/* Operator Repository Grid */}
      <div className="col-lg-7">
         <div className="p-4 rounded-4 border bg-white h-100 shadow-sm border-secondary-subtle">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
               <div className="d-flex align-items-center gap-2">
                  <RiSearchLine className="text-secondary" />
                  <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">DTH Operator Repository</h6>
               </div>
               <div className="position-relative">
                  <RiSearchLine className="position-absolute translate-middle-y translate-middle-x" style={{ left: '15px', top: '50%', fontSize: '12px' }} />
                  <input className="form-control form-control-sm ps-4 border-secondary-subtle rounded-pill bg-light" placeholder="Search operator..." style={{ width: '200px' }} value={rechargeOperatorSearch} onChange={(e) => setRechargeOperatorSearch(e.target.value)} />
               </div>
            </div>

            <div className="row g-3 overflow-auto scrollbar-hidden" style={{ maxHeight: '450px' }}>
               {filteredRechargeOperators.map((operator) => (
                 <div key={operator.key} className="col-md-6 col-xl-4">
                    <button type="button" className={`btn w-100 h-100 p-3 rounded-4 border transition-all text-start d-flex align-items-center gap-3 ${dthOperator === operator.key ? 'border-primary bg-primary bg-opacity-10' : 'bg-light hover-bg-light border-secondary-subtle'}`} onClick={() => setDthOperator(operator.key)}>
                       <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold border" style={{ width: '40px', height: '40px', backgroundColor: operator.color, color: operator.textColor }}>
                          {operator.mark}
                       </div>
                       <div>
                          <div className="fw-bold text-dark extra-small lh-1 mb-1">{operator.title}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>Satellite Hub</div>
                       </div>
                    </button>
                 </div>
               ))}
               {filteredRechargeOperators.length === 0 && (
                 <div className="col-12 text-center py-5 opacity-50">
                    <RiTvLine size={48} className="mb-3" />
                    <div className="fw-bold small">No matching satellite hubs found</div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default RoleRechargeDthView;
