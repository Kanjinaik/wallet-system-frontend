import React from "react";
import { 
  RiWallet3Line, 
  RiSmartphoneLine, 
  RiArrowRightSLine 
} from "react-icons/ri";
import RoleRechargeMobileView from "./RoleRechargeMobileView";

const RoleRechargeSection = ({ ctx }) => {
  const {
    role,
    activeSection,
    formatCurrency,
    retailerDashboard,
    mainWallet,
    RECHARGE_SERVICES,
    selectedRechargeService,
    setSelectedRechargeService,
    setRechargeOperatorSearch,
  } = ctx;

  if (role !== "retailer" || activeSection !== "recharge") return null;

  const gateway = retailerDashboard?.recharge_gateway || null;
  const gatewayTone =
    gateway?.status === "live_ready"
      ? { badge: "bg-success-subtle text-success border-success-subtle", dot: "bg-success" }
      : gateway?.status === "test_ready"
        ? { badge: "bg-warning-subtle text-warning border-warning-subtle", dot: "bg-warning" }
        : { badge: "bg-danger-subtle text-danger border-danger-subtle", dot: "bg-danger" };

  return (
    <section className="py-2 animate-fade-in">
      {/* Header Intelligence Hub */}
      <div className="card border shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
             <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-circle bg-primary-subtle text-primary shadow-sm" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
                   <RiSmartphoneLine size={32} />
                </div>
                <div>
                   <h4 className="fw-bold text-dark m-0">Mobile Prepaid Recharge</h4>
                   <p className="text-muted small m-0 mt-1">Live prepaid mobile recharge through your configured PayU API connection</p>
                </div>
             </div>
             <div className="bg-light p-3 rounded-4 border d-flex align-items-center gap-3 shadow-sm">
                <div className="bg-white p-2 rounded-circle shadow-sm">
                   <RiWallet3Line size={24} className="text-success" />
                </div>
                <div>
                   <small className="text-muted text-uppercase fw-bold extra-small ls-wide d-block mb-1">Operational Liquidity</small>
                   <strong className="h5 fw-bold text-dark m-0">{formatCurrency(retailerDashboard?.wallet_balance || mainWallet?.balance || 0)}</strong>
                </div>
             </div>
          </div>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4 pt-3 border-top">
            <div>
              <div className="text-muted text-uppercase fw-bold extra-small mb-1">Recharge Gateway Status</div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className={`badge border rounded-pill px-3 py-2 ${gatewayTone.badge}`}>
                  <span className={`d-inline-block rounded-circle me-2 ${gatewayTone.dot}`} style={{ width: 8, height: 8 }} />
                  {gateway?.status_label || "Disabled"}
                </span>
                <span className="small text-muted">
                  Provider: <strong>{gateway?.provider || "payu"}</strong>
                </span>
                <span className="small text-muted">
                  Mode: <strong>{gateway?.mode || "unknown"}</strong>
                </span>
                <span className="small text-muted">
                  Real-time: <strong>{gateway?.can_attempt_realtime ? "Yes" : "No"}</strong>
                </span>
              </div>
            </div>
            {gateway?.missing?.length > 0 ? (
              <div className="small text-danger">
                Missing: {gateway.missing.join(", ")}
              </div>
            ) : (
              <div className="small text-muted">
                {gateway?.can_attempt_realtime
                  ? "Live instant prepaid recharge is active through PayU wallet settlement."
                  : "Test mode or setup is still incomplete for prepaid recharge."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Fidelity Service Navigation */}
      <div className="card border shadow-sm rounded-4 mb-4 bg-white p-3">
         <div className="d-flex align-items-center gap-2 overflow-auto pb-2 scrollbar-hidden">
            {RECHARGE_SERVICES.map((service) => (
              <button 
                key={service.key} 
                type="button" 
                className={`btn d-flex align-items-center gap-3 px-4 py-3 rounded-pill border-0 transition-all text-nowrap ${selectedRechargeService === service.key ? 'bg-primary text-white shadow' : 'bg-light text-muted hover-bg-light border border-secondary-subtle'}`}
                style={{ backgroundColor: selectedRechargeService === service.key ? '#4f46e5' : undefined }}
                onClick={() => { setSelectedRechargeService(service.key); setRechargeOperatorSearch(""); }}
              >
                <div className={`${selectedRechargeService === service.key ? 'text-white' : 'text-primary'}`}>
                  <RiSmartphoneLine size={24} />
                </div>
                <span className="fw-bold">{service.label}</span>
                {selectedRechargeService === service.key && <RiArrowRightSLine className="opacity-75" />}
              </button>
            ))}
         </div>
      </div>

      {/* Operational Protocol View */}
      <div className="card border shadow-sm rounded-4 bg-white p-4">
        <RoleRechargeMobileView ctx={ctx} />
      </div>

    </section>
  );
};

export default RoleRechargeSection;
