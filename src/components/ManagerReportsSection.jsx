import React, { useMemo, useState } from "react";
import {
  RiFileTextLine,
  RiDownload2Line,
  RiFilter2Line,
  RiSearchLine,
  RiCalendarCheckLine,
  RiUserFollowLine,
  RiBankCardLine,
  RiLineChartLine,
  RiNotification3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiGroupLine,
  RiPieChart2Line,
  RiFileList3Line,
  RiFileExcel2Line,
  RiHistoryLine
} from "react-icons/ri";
import { downloadCsv } from "./roleDashboardHelpers";

const EMPTY_LIST = [];
const REPORT_FILTER_INPUT_STYLE = {
  color: '#0f172a',
  WebkitTextFillColor: '#0f172a'
};

/**
 * Professional Status Badge (Bootstrap 5)
 */
const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();
  let bg = "bg-secondary";
  let text = "text-secondary";

  if (["success", "completed", "approved", "processed"].includes(normalized)) {
    bg = "bg-success-subtle";
    text = "text-success";
  } else if (["pending", "processing", "initiated"].includes(normalized)) {
    bg = "bg-warning-subtle";
    text = "text-warning-emphasis";
  } else if (["failed", "rejected", "cancelled", "declined", "error"].includes(normalized)) {
    bg = "bg-danger-subtle";
    text = "text-danger";
  }

  return (
    <span className={`badge ${bg} ${text} border-0 rounded-pill px-3 py-2 fw-bold text-uppercase`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
      {status}
    </span>
  );
};

const formatDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "??";
};

const ManagerReportsSection = ({ ctx }) => {
  const {
    role,
    activeSection,
    reportsData,
    reportsFilters,
    reportsLoading,
    notifications = [],
    managerData,
    onMarkAllRead,
    onFilterChange,
    onReset,
    onGenerate,
  } = ctx;

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const isManagerRole = role === "super_distributor" || role === "master_distributor";
  const shouldRender = isManagerRole && activeSection === "reports";

  const summary = reportsData?.summary || {};
  const earnings = reportsData?.earnings || EMPTY_LIST;
  const distributorPerformance = reportsData?.distributor_performance || EMPTY_LIST;
  const rows = reportsData?.rows || EMPTY_LIST;
  const distributors = reportsData?.filters?.distributors || EMPTY_LIST;
  const retailers = reportsData?.filters?.retailers || EMPTY_LIST;
  const managedUsers = managerData?.distributors || EMPTY_LIST;

  const totalRetailers = retailers.length;
  const totalTransactions = summary.total_transactions || rows.length || 0;

  const filteredRetailers = useMemo(() => {
    if (!reportsFilters.distributorId || reportsFilters.distributorId === "all") return retailers;
    return retailers.filter((r) => String(r.distributor_id) === String(reportsFilters.distributorId));
  }, [retailers, reportsFilters.distributorId]);

  const visibleRows = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    const filtered = !needle
      ? rows
      : rows.filter((row) =>
        [row.distributor, row.retailer, row.reference, row.status]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    return filtered;
  }, [rows, searchTerm]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const recentUsers = useMemo(() => {
    const primaryList = managedUsers.length
      ? managedUsers.map((item) => ({
        id: `managed-${item.id}`,
        name: item.name,
        subtitle: item.email || item.phone || (role === "master_distributor" ? "Super Distributor" : "Distributor"),
        status: item.is_active ? "Active" : "Inactive",
      }))
      : retailers.map((item) => ({
        id: `retailer-${item.id}`,
        name: item.name,
        subtitle: "Retailer",
        status: "Mapped",
      }));
    return primaryList.slice(0, 5);
  }, [managedUsers, retailers, role]);

  const exportTransactions = () => {
    const data = [
      ["Date", "Distributor", "Retailer", "Deposit Amount", "Commission", "Status"],
      ...rows.map((row) => [
        new Date(row.date).toLocaleString(),
        row.distributor,
        row.retailer,
        row.amount,
        row.commission,
        row.status,
      ]),
    ];
    downloadCsv(data, "transaction_report.csv");
  };

  if (!shouldRender) return null;

  return (
    <div className="container-fluid px-4 pt-2 pb-5">
      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
        <div>
          <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <RiFileList3Line className="text-primary" /> System Ledger & Analytics
          </h4>
          <p className="text-muted small m-0 mt-1">Audit-grade reports and network performance metrics</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm px-3 fw-bold rounded-2 d-flex align-items-center gap-2" onClick={exportTransactions}>
            <RiDownload2Line /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm px-4 fw-bold rounded-2 shadow-sm d-flex align-items-center gap-2 border-0" onClick={onGenerate} disabled={reportsLoading} style={{ backgroundColor: '#4f46e5' }}>
            {reportsLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <RiLineChartLine />}
            Sync Analytics
          </button>
        </div>
      </div>

      {/* Metric Cards (Wallet System Style) */}
      <div className="row g-4 mb-5">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-primary">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Network Yield</span>
                <RiLineChartLine className="text-primary opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-1">{formatCurrency(summary.total_commission)}</h2>
              <div className="d-flex align-items-center gap-2 small">
                <span className="badge bg-success-subtle text-success rounded-pill fw-bold">Active Protocol</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Mapped Entities</span>
                <RiGroupLine className="text-secondary opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-1">{totalRetailers}</h2>
              <p className="text-muted small m-0 fw-medium">{filteredRetailers.length} Retailers in current view</p>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Aggregate Inflow</span>
                <RiBankCardLine className="text-info opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-1">{formatCurrency(summary.total_deposits)}</h2>
              <p className="text-muted small m-0 fw-medium">{totalTransactions} Validated Events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-5">
        {/* Main Content: Filters & Table */}
        <div className="col-xl-8">
          {/* Advanced Filter Panel */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0 d-flex align-items-center gap-2">
              <RiFilter2Line className="text-primary" />
              <h6 className="fw-bold m-0 text-dark">Data Optimization Engine</h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Start Boundary</label>
                  <input type="date" className="form-control form-control-sm fw-bold rounded-2 border-secondary-subtle" style={REPORT_FILTER_INPUT_STYLE} value={reportsFilters.fromDate} onChange={(e) => onFilterChange("fromDate", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">End Boundary</label>
                  <input type="date" className="form-control form-control-sm fw-bold rounded-2 border-secondary-subtle" style={REPORT_FILTER_INPUT_STYLE} value={reportsFilters.toDate} onChange={(e) => onFilterChange("toDate", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Distributor</label>
                  <select className="form-select form-select-sm fw-bold rounded-2 border-secondary-subtle" style={REPORT_FILTER_INPUT_STYLE} value={reportsFilters.distributorId} onChange={(e) => onFilterChange("distributorId", e.target.value)}>
                    <option value="all" style={{ color: '#000' }}>All Channels</option>
                    {distributors.map((dist) => (
                      <option key={dist.id} value={dist.id} style={{ color: '#000' }}>{dist.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Entity Status</label>
                  <select className="form-select form-select-sm fw-bold rounded-2 border-secondary-subtle" style={REPORT_FILTER_INPUT_STYLE} value={reportsFilters.status} onChange={(e) => onFilterChange("status", e.target.value)}>
                    <option value="all" style={{ color: '#000' }}>Any Status</option>
                    <option value="success" style={{ color: '#000' }}>Success</option>
                    <option value="pending" style={{ color: '#000' }}>Pending</option>
                    <option value="failed" style={{ color: '#000' }}>Failed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 pt-3 border-top d-flex gap-2">
                <button className="btn btn-primary btn-sm px-4 fw-bold rounded-2 border-0" onClick={onGenerate} style={{ backgroundColor: '#4f46e5' }}>Execute Filter</button>
                <button className="btn btn-light btn-sm px-4 fw-bold rounded-2 border text-muted" onClick={() => { onReset?.(); setSearchTerm(""); setPage(1); }}>Reset Registry</button>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-header bg-transparent border-0 p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted"><RiSearchLine /></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 shadow-none ps-0 text-black fw-bold"
                  style={{ color: '#000' }}
                  placeholder="Search Ledger..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
              </div>
              <span className="badge bg-light text-muted border py-2 px-3 rounded-2 fw-bold small">
                {visibleRows.length} RECORDS FOUND
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light border-top border-bottom">
                  <tr>
                    <th className="py-3 px-4 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Entry Date</th>
                    <th className="py-3 px-3 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Channel/Merchant</th>
                    <th className="py-3 px-3 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>Revenue Share</th>
                    <th className="py-3 px-3 border-0 text-muted text-uppercase small fw-bold" style={{ fontSize: '10px' }}>GTV Amount</th>
                    <th className="py-3 px-4 border-0 text-muted text-uppercase small fw-bold text-center" style={{ fontSize: '10px' }}>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, idx) => (
                    <tr key={row.id || idx} className="border-bottom">
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{formatDate(row.date)}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{row.distributor}</div>
                        <div className="text-primary fw-medium small" style={{ fontSize: '11px' }}>ID: {row.retailer}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="fw-bold text-success" style={{ fontSize: '13px' }}>+{formatCurrency(row.commission)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{formatCurrency(row.amount)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {!paginatedRows.length && (
                    <tr>
                      <td colSpan="5" className="py-5 text-center text-muted fw-medium">No ledger entries detected for the current session parameters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Flow */}
            <div className="card-footer bg-transparent border-0 p-4 d-flex align-items-center justify-content-between">
              <span className="small text-muted fw-bold">Page {currentPage} of {totalPages}</span>
              <div className="pagination pagination-sm gap-1 m-0">
                <button className="btn btn-light btn-sm border fw-bold rounded-2 px-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <RiArrowLeftSLine />
                </button>
                <div className="d-flex gap-1 mx-2">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button key={i} className={`btn btn-sm fw-bold rounded-2 px-3 ${currentPage === i + 1 ? 'btn-primary' : 'btn-light border'}`} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button className="btn btn-light btn-sm border fw-bold rounded-2 px-2" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <RiArrowRightSLine />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics & Activity */}
        <div className="col-xl-4 text-dark">
          {/* Performance Overview (Wallet Report Style) */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h6 className="fw-bold m-0 d-flex align-items-center gap-2">
                <RiPieChart2Line className="text-primary" /> Channel Performance
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-4">
                {distributorPerformance.slice(0, 5).map((bar, i) => {
                  const max = Math.max(...distributorPerformance.map(b => b.deposit), 1);
                  const width = Math.min(100, (bar.deposit / max) * 100);
                  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
                  return (
                    <div key={bar.name || i}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{bar.name}</span>
                        <strong className="small text-dark">{formatCurrency(bar.deposit)}</strong>
                      </div>
                      <div className="progress rounded-pill bg-light" style={{ height: '6px' }}>
                        <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${width}%`, backgroundColor: colors[i % colors.length] }} aria-valuenow={width} aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                    </div>
                  );
                })}
                {!distributorPerformance.length && <div className="text-center py-4 text-muted small fw-medium">No performance data captured.</div>}
              </div>
            </div>
          </div>

          {/* Recent Protocol Activity (Notifications) */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-transparent border-0 p-4 pb-0 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
                <RiNotification3Line className="text-warning" /> Security & Sync Alerts
              </h6>
              <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none p-0 small" onClick={onMarkAllRead}>Clear All</button>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {notifications.slice(0, 4).map((item, idx) => (
                  <div key={item.id || idx} className="d-flex gap-3 p-3 rounded-3 bg-light bg-opacity-50 border border-light">
                    <div className="p-2 bg-white rounded-circle shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <span className="small fw-bold text-primary" style={{ fontSize: '10px' }}>{getInitials(item.title || "AL")}</span>
                    </div>
                    <div>
                      <h6 className="small fw-bold text-dark mb-1">{item.title || "Network Event"}</h6>
                      <p className="text-muted extra-small m-0 lh-sm" style={{ fontSize: '11px' }}>{item.message || "System parameter updated successfully."}</p>
                      <small className="text-muted mt-2 d-block" style={{ fontSize: '9px' }}>{item.created_at ? formatDate(item.created_at) : "Real-time"}</small>
                    </div>
                  </div>
                ))}
                {!notifications.length && <div className="text-center py-4 text-muted small fw-medium">No alerts detected in current cycle.</div>}
              </div>
            </div>
          </div>

          {/* Entity Registry (Recent Users) */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
                <RiUserFollowLine className="text-success" /> Entity Registry
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-4">
                {recentUsers.map((item) => (
                  <div key={item.id} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-primary-subtle text-primary rounded-2 shadow-sm d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '10px' }}>{getInitials(item.name)}</div>
                      <div>
                        <h6 className="small fw-bold text-dark m-0">{item.name}</h6>
                        <span className="text-muted extra-small" style={{ fontSize: '10px' }}>{item.subtitle}</span>
                      </div>
                    </div>
                    <span className={`badge ${item.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-light text-muted'} rounded-pill extra-small px-2 py-1 fw-bold`} style={{ fontSize: '9px' }}>{item.status}</span>
                  </div>
                ))}
                {!recentUsers.length && <div className="text-center py-4 text-muted small fw-medium text-dark">Registry is currently empty.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReportsSection;
