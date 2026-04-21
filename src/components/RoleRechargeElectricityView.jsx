import React from "react";
import { 
  RiFlashlightLine, 
  RiBuilding4Line, 
  RiMapPinRangeLine, 
  RiSmartphoneLine,
  RiMoneyDollarCircleLine,
  RiCheckDoubleLine,
  RiShieldFlashLine,
  RiInformationLine
} from "react-icons/ri";

const RoleRechargeElectricityView = ({ ctx }) => {
  const {
    handleRechargeSubmit,
    electricityBillType,
    setElectricityBillType,
    electricityCity,
    setElectricityCity,
    electricityApartment,
    setElectricityApartment,
    electricityFlatNo,
    setElectricityFlatNo,
    electricityMobile,
    setElectricityMobile,
    electricityState,
    setElectricityState,
    INDIA_STATES,
    electricityBoard,
    setElectricityBoard,
    ELECTRICITY_BOARD_OPTIONS,
    electricityServiceNumber,
    setElectricityServiceNumber,
    electricityAmount,
    setElectricityAmount,
  } = ctx;

  return (
    <div className="animate-fade-in">
      <div className="p-4 rounded-4 border bg-light bg-opacity-10 shadow-sm border-secondary-subtle">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
           <div className="d-flex align-items-center gap-2 text-warning">
              <RiFlashlightLine size={24} />
              <h6 className="fw-bold m-0 text-dark text-uppercase extra-small ls-wide">Infrastructure Protocol Configuration</h6>
           </div>
           <div className="badge bg-light text-muted border px-3 py-2 rounded-pill extra-small fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
              <span className="text-primary fw-bold" style={{ fontSize: '10px' }}>PAYU</span> Secured Recharge
           </div>
        </div>

        <form onSubmit={handleRechargeSubmit}>
          {/* Bill Classification Toggle */}
          <div className="mb-4">
            <label className="form-label extra-small fw-bold text-muted text-uppercase d-block mb-3 text-center">Service Classification</label>
            <div className="btn-group w-100 p-1 bg-light rounded-pill border shadow-sm" role="group">
              <input type="radio" className="btn-check" name="electricityBillType" id="boards" autoComplete="off" checked={electricityBillType === "electricity-boards"} onChange={() => setElectricityBillType("electricity-boards")} />
              <label className="btn btn-sm rounded-pill fw-bold py-2 border-0" htmlFor="boards">Electricity Boards</label>
              
              <input type="radio" className="btn-check" name="electricityBillType" id="apartments" autoComplete="off" checked={electricityBillType === "apartments"} onChange={() => setElectricityBillType("apartments")} />
              <label className="btn btn-sm rounded-pill fw-bold py-2 border-0" htmlFor="apartments">Apartments</label>
            </div>
          </div>

          <div className="row g-4">
            {electricityBillType === "apartments" ? (
              <>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">City Hub *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiBuilding4Line size={18}/></span>
                    <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={electricityCity} onChange={(e) => setElectricityCity(e.target.value)} placeholder="e.g. Mumbai" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">Apartment Entity *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiBuilding4Line size={18}/></span>
                    <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={electricityApartment} onChange={(e) => setElectricityApartment(e.target.value)} placeholder="e.g. Skyline Towers" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">Unit Identifier (Flat No) *</label>
                  <input className="form-control fw-bold border-secondary-subtle" value={electricityFlatNo} onChange={(e) => setElectricityFlatNo(e.target.value)} placeholder="e.g. A-402" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">Primary Mobile Node *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiSmartphoneLine size={18}/></span>
                    <input className="form-control border-start-0 fw-bold border-secondary-subtle" value={electricityMobile} onChange={(e) => setElectricityMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" maxLength={10} required />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">State Authority *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiMapPinRangeLine size={18}/></span>
                    <select className="form-select border-start-0 fw-bold border-secondary-subtle" value={electricityState} onChange={(e) => setElectricityState(e.target.value)} required>
                      <option value="">Select Hub State</option>
                      {INDIA_STATES.map((state) => (<option key={state} value={state}>{state}</option>))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">Electricity Board *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted"><RiShieldFlashLine size={18}/></span>
                    <select className="form-select border-start-0 fw-bold border-secondary-subtle" value={electricityBoard} onChange={(e) => setElectricityBoard(e.target.value)} required>
                      <option value="">Select Board</option>
                      {ELECTRICITY_BOARD_OPTIONS.map((board) => (<option key={board} value={board}>{board}</option>))}
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 m-0">Consumable Service Number *</label>
                    <button type="button" className="btn btn-link p-0 extra-small fw-bold text-primary text-decoration-none">View Sample Bill</button>
                  </div>
                  <input className="form-control form-control-lg fw-bold border-secondary-subtle bg-white shadow-sm" value={electricityServiceNumber} onChange={(e) => setElectricityServiceNumber(e.target.value)} placeholder="Enter Service Account Number" required />
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="form-label extra-small fw-bold text-muted text-uppercase lh-1 mb-2">Amount *</label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-end-0 text-muted"><RiMoneyDollarCircleLine size={18}/></span>
              <input
                type="number"
                min="1"
                step="1"
                className="form-control border-start-0 fw-bold border-secondary-subtle"
                value={electricityAmount}
                onChange={(e) => setElectricityAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="alert bg-primary bg-opacity-10 border-0 text-primary p-4 rounded-4 my-4 d-flex gap-3">
             <RiInformationLine size={24} className="flex-shrink-0" />
             <div className="small">
                <p className="fw-bold mb-1">Audit Notice:</p>
                <span className="opacity-75">
                  {electricityBillType === "apartments" 
                    ? "Settlements via apartment protocols may require 24-48 business hours for ledger synchronization." 
                    : "By confirming, you authorize automated bill retrieval protocols for this service identifier."}
                </span>
             </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3" style={{ backgroundColor: '#4f46e5' }}>
            Initiate Energy Settlement <RiCheckDoubleLine size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleRechargeElectricityView;
