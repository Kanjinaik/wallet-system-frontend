import React from "react";
import { 
  RiGroupLine, 
  RiUserFollowLine, 
  RiUserUnfollowLine, 
  RiStore2Line,
  RiShieldUserLine
} from "react-icons/ri";

const RoleManagerRolesSection = ({ ctx }) => {
  const { role, activeSection, userManagementTab, isMasterRole, managerData, user } = ctx;

  if (!(role === "master_distributor" || role === "super_distributor") || activeSection !== "user-management" || userManagementTab !== "roles") {
    return null;
  }

  const distributors = managerData?.distributors || [];
  const totalRetailers = distributors.reduce((sum, item) => sum + Number(item.total_retailers || 0), 0);
  const activeCount = distributors.filter((item) => item.is_active).length;
  const inactiveCount = distributors.filter((item) => !item.is_active).length;

  return (
    <div className="py-2">
      {/* Intelligence Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="card-body p-4 border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  {isMasterRole ? "Total Super Distributors" : "Total Distributors"}
                </span>
                <RiGroupLine className="text-success opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{managerData?.total_distributors || 0}</h2>
              <p className="text-muted extra-small m-0 mt-2 fw-medium">Operational lifecycle active</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="card-body p-4 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  {isMasterRole ? "Active Super Dist." : "Active Dist."}
                </span>
                <RiUserFollowLine className="text-primary opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{activeCount}</h2>
              <p className="text-primary extra-small m-0 mt-2 fw-bold">Live Network Threads</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="card-body p-4 border-start border-4 border-danger">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  {isMasterRole ? "Inactive Super Dist." : "Inactive Dist."}
                </span>
                <RiUserUnfollowLine className="text-danger opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{inactiveCount}</h2>
              <p className="text-muted extra-small m-0 mt-2 fw-medium">Action Required / Dormant</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="card-body p-4 border-start border-4 border-indigo" style={{ borderColor: '#6366f1' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  Aggregate Retailers
                </span>
                <RiStore2Line className="text-indigo opacity-50" size={20} style={{ color: '#6366f1' }} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{totalRetailers}</h2>
              <p className="text-muted extra-small m-0 mt-2 fw-medium">Downstream connection count</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Hierarchy Table */}
      <div className="card border shadow-sm rounded-3 bg-white">
        <div className="card-header bg-light border-0 py-3 px-4 d-flex align-items-center gap-2">
          <RiShieldUserLine className="text-primary" />
          <h6 className="fw-bold m-0 text-dark">Administrative Role Hierarchy</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-top border-bottom">
                <tr>
                  <th className="py-3 px-4 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Role Identifier</th>
                  <th className="py-3 px-3 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Cumulative Count</th>
                  <th className="py-3 px-3 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Operational (Active)</th>
                  <th className="py-3 px-4 border-0 text-muted text-uppercase small fw-bold text-end" style={{ fontSize: '10px' }}>Non-Operational (Inactive)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-bottom">
                  <td className="py-3 px-4">
                    <div className="fw-bold text-dark">{isMasterRole ? "Master Distributor" : "Super Distributor"}</div>
                    <div className="text-muted extra-small">Primary administrative node</div>
                  </td>
                  <td className="py-3 px-3 fw-bold">1</td>
                  <td className="py-3 px-3">
                    <span className={`badge ${user?.is_active === false ? 'bg-light text-muted' : 'bg-success-subtle text-success'} rounded-pill px-3`}>
                      {user?.is_active === false ? 0 : 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-end fw-medium text-muted">
                    {user?.is_active === false ? 1 : 0}
                  </td>
                </tr>
                <tr className="border-bottom">
                  <td className="py-3 px-4">
                    <div className="fw-bold text-dark">{isMasterRole ? "Super Distributor" : "Distributor"}</div>
                    <div className="text-muted extra-small">Secondary distribution network</div>
                  </td>
                  <td className="py-3 px-3 fw-bold">{managerData?.total_distributors || 0}</td>
                  <td className="py-3 px-3">
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3">{activeCount}</span>
                  </td>
                  <td className="py-3 px-4 text-end fw-medium text-muted">{inactiveCount}</td>
                </tr>
                <tr className="border-bottom bg-light bg-opacity-10">
                  <td className="py-3 px-4">
                    <div className="fw-bold text-dark">Retailer Network</div>
                    <div className="text-muted extra-small">End-point merchant nodes</div>
                  </td>
                  <td className="py-3 px-3 fw-bold">{totalRetailers}</td>
                  <td className="py-3 px-3">
                    <span className="text-muted small fw-bold italic">— Protected —</span>
                  </td>
                  <td className="py-3 px-4 text-end fw-medium text-muted">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .ls-wide { letter-spacing: 0.1em; }
        .extra-small { font-size: 11px; }
        .fs-xs { font-size: 10px; }
      `}</style>
    </div>
  );
};

export default RoleManagerRolesSection;
