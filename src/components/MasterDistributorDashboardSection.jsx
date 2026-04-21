import React, { useCallback, useMemo, useState } from "react";
import { formatCurrency } from "./constants";
import {
  RiWallet3Line,
  RiNodeTree,
  RiTeamLine,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiPieChart2Line,
  RiHistoryLine,
  RiUserAddLine,
  RiListCheck,
  RiShieldUserLine,
  RiDownload2Line
} from "react-icons/ri";

const defaultFn = () => { };
const EMPTY_LIST = [];

const MasterDistributorDashboardSection = ({
  activeSection,
  managerData,
  isMasterRole,
  recentTransactions = [],
  transactions = [],
  onAddDistributor = defaultFn,
  onAddTransaction = defaultFn,
  onViewTransactions = defaultFn,
  onViewWallet = defaultFn,
}) => {
  const [earningsRange, setEarningsRange] = useState("week");
  const [distributorFilter, setDistributorFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [distributorSearch, setDistributorSearch] = useState("");

  const sourceTransactions = transactions.length ? transactions : recentTransactions;
  const distributors = managerData?.distributors || EMPTY_LIST;

  const totalRetailers = useMemo(
    () => distributors.reduce((sum, d) => sum + Number(d.total_retailers || 0), 0),
    [distributors]
  );

  const commissionTransactions = useMemo(
    () => sourceTransactions.filter((tx) => tx.commission_amount != null || String(tx.type || "").toLowerCase().includes("commission")),
    [sourceTransactions]
  );

  const sumInWindow = (items, start, end) =>
    items.reduce((sum, tx) => {
      const dt = new Date(tx.created_at || tx.date || tx.createdAt);
      if (Number.isNaN(dt.getTime())) return sum;
      if (dt >= start && dt < end) {
        const amount = Number(tx.commission_amount ?? tx.amount ?? tx.deposit_amount ?? 0);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }
      return sum;
    }, 0);

  const buildWindowDelta = useCallback((items, daysBack = 7) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - daysBack);
    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - daysBack);
    const current = sumInWindow(items, start, end);
    const previous = sumInWindow(items, prevStart, start);
    const delta = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
    return { current, previous, delta: Math.round(delta) };
  }, []);

  const commissionDelta = useMemo(() => buildWindowDelta(commissionTransactions), [buildWindowDelta, commissionTransactions]);

  const totalDeposits = useMemo(
    () =>
      sourceTransactions.reduce((sum, tx) => {
        const amount = Number(tx.deposit_amount ?? tx.amount ?? 0);
        const isDeposit =
          String(tx.type || "").toLowerCase().includes("deposit") ||
          String(tx.description || "").toLowerCase().includes("deposit") ||
          amount > 0;
        return isDeposit ? sum + (Number.isFinite(amount) ? amount : 0) : sum;
      }, 0),
    [sourceTransactions]
  );

  const depositDelta = useMemo(() => buildWindowDelta(sourceTransactions), [buildWindowDelta, sourceTransactions]);

  const earningsSeries = useMemo(() => {
    const buckets = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sliceAmount = (start, end) => sumInWindow(commissionTransactions, start, end);

    if (earningsRange === "month") {
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        buckets.push({
          label: start.toLocaleString("en-US", { month: "short" }),
          value: sliceAmount(start, end),
        });
      }
      return buckets;
    }

    if (earningsRange === "week") {
      const startOfWeek = (date) => {
        const d = new Date(date);
        const diff = d.getDate() - d.getDay();
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };
      const currentWeekStart = startOfWeek(now);
      for (let i = 5; i >= 0; i--) {
        const start = new Date(currentWeekStart);
        start.setDate(start.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        buckets.push({
          label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: sliceAmount(start, end),
        });
      }
      return buckets;
    }

    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      buckets.push({
        label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: sliceAmount(start, end),
      });
    }
    return buckets;
  }, [earningsRange, commissionTransactions]);

  const toLinePoints = (series) => {
    if (!series.length) return "";
    const maxVal = Math.max(...series.map((s) => s.value), 1);
    return series
      .map((item, idx) => {
        const x = (idx / Math.max(series.length - 1, 1)) * 100;
        const y = 100 - (item.value / maxVal) * 100;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const distributorBars = useMemo(() => {
    const totals = new Map();
    sourceTransactions.forEach((tx) => {
      const distributorName = tx.created_by_distributor || tx.distributor_name || tx.name || "Unmapped";
      const amount = Number(tx.deposit_amount ?? tx.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) return;
      totals.set(distributorName, (totals.get(distributorName) || 0) + amount);
    });
    distributors.forEach((dist) => {
      if (!totals.has(dist.name)) {
        totals.set(dist.name, Number(dist.balance || 0));
      }
    });
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sourceTransactions, distributors]);

  const topRetailers = useMemo(() => {
    const totals = new Map();
    sourceTransactions.forEach((tx) => {
      const name =
        tx.retailer_name ||
        tx.retailer ||
        tx.created_by_retailer ||
        tx.user?.name ||
        tx.description?.split(" ")[0] ||
        "Retailer";
      const amount = Number(tx.deposit_amount ?? tx.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0 || name === "-") return;
      totals.set(name, (totals.get(name) || 0) + amount);
    });
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [sourceTransactions]);

  const filteredDistributors = useMemo(() => {
    const term = distributorSearch.trim().toLowerCase();
    return distributors.filter((dist) => {
      if (distributorFilter === "active" && !dist.is_active) return false;
      if (distributorFilter === "inactive" && dist.is_active) return false;
      if (!term) return true;
      const lookup = `${dist.name} ${dist.email} ${dist.phone}`.toLowerCase();
      return lookup.includes(term);
    });
  }, [distributors, distributorFilter, distributorSearch]);

  const filteredTransactions = useMemo(() => {
    const filter = String(transactionFilter || "all").toLowerCase();
    return sourceTransactions
      .filter((tx) => {
        if (filter === "all") return true;
        const type = String(tx.type || tx.description || "").toLowerCase();
        if (filter === "deposit") return type.includes("deposit");
        if (filter === "withdraw") return type.includes("withdraw");
        if (filter === "commission") return tx.commission_amount != null || type.includes("commission");
        return true;
      })
      .slice(0, 10);
  }, [sourceTransactions, transactionFilter]);

  const formatDate = (value) => {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const heroProfile = managerData?.super_distributor_profile || managerData?.master_profile;

  if (activeSection !== "dashboard") {
    return null;
  }

  // Functional Reusable Component for Premium Buttons
  const ActionButton = ({ onClick, children, variant = 'primary', className = '', ...props }) => {
    const themes = {
      primary: {
        bg: '#4f46e5',
        color: '#ffffff',
        border: 'none'
      },
      secondary: {
        bg: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0'
      },
      outline: {
        bg: 'transparent',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      },
      dark: {
        bg: '#1e293b',
        color: '#ffffff',
        border: 'none'
      }
    };
    const current = themes[variant] || themes.primary;

    return (
      <button
        onClick={onClick}
        className={`btn d-flex align-items-center justify-content-center px-4 py-2 fw-bold transition-all ${className}`}
        style={{
          backgroundColor: current.bg,
          color: current.color,
          border: current.border,
          borderRadius: '10px',
          fontSize: '13px',
          letterSpacing: '0.02em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: variant === 'primary' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
        }}
        {...props}
      >
        {children}
      </button>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, delta, deltaLabel, color = '#4f46e5', subValue, subLabel }) => (
    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ backgroundColor: '#fff' }}>
      <div className="card-body p-4 position-relative">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="p-2 rounded-3" style={{ backgroundColor: `${color}15` }}>
            <Icon size={22} style={{ color }} />
          </div>
          {delta !== undefined && (
            <div className={`d-flex align-items-center gap-1 badge ${delta >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill px-2 py-1`}>
              {delta >= 0 ? <RiArrowRightUpLine /> : <RiArrowRightDownLine />}
              <span className="fw-bold" style={{ fontSize: '11px' }}>{Math.abs(delta)}%</span>
            </div>
          )}
        </div>
        <span className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <h3 className="fw-bold mt-1 m-0" style={{ color: '#1e293b', fontSize: '1.5rem' }}>
          {typeof value === 'number' ? formatCurrency(value) : value}
        </h3>
        {subValue !== undefined && (
          <div
            className="d-inline-flex align-items-center gap-2 mt-2 px-2 py-1 rounded-3"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <span className="fw-semibold" style={{ fontSize: '12px', color: '#475569' }}>
              {subLabel || 'Available'}
            </span>
            <span className="fw-bold" style={{ fontSize: '12px', color: color }}>
              {typeof subValue === 'number' ? formatCurrency(subValue) : subValue}
            </span>
          </div>
        )}
        {deltaLabel && <p className="text-muted m-0 mt-2" style={{ fontSize: '11px' }}>{deltaLabel}</p>}
        <div className="position-absolute" style={{ right: '-20px', bottom: '-20px', opacity: 0.03 }}>
          <Icon size={100} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-5">
      {/* Hero Summary Section */}
      <section className="row g-4 mb-4 mt-2">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 text-white h-100 overflow-hidden"
            style={{ backgroundColor: '#1e293b' }}>
            <div className="card-body p-4 d-flex flex-column justify-content-between position-relative z-1">
              <div>
                <span className="opacity-75 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>
                  {isMasterRole ? "Master Management" : "Super Management"}
                </span>
                <div className="d-flex align-items-baseline gap-3 mt-1">
                  <h1 className="fw-bold m-0" style={{ fontSize: '2.5rem' }}>
                    {formatCurrency(managerData?.commission_earned)}
                  </h1>
                  <span className="badge bg-primary-subtle text-primary border-0 rounded-pill px-3 py-1" style={{ fontSize: '10px' }}>
                    Net Commission Revenue
                  </span>
                </div>
                <p className="mt-3 opacity-75" style={{ fontSize: '14px', maxWidth: '450px' }}>
                  Orchestrate your distributor network, monitor chain-level liquidity, and manage high-volume retailer transactions.
                </p>
              </div>

              <div className="d-flex gap-3 mt-4">
                <ActionButton onClick={onAddDistributor} variant="primary">
                  <RiShieldUserLine className="me-2" size={18} /> Add Partner
                </ActionButton>
                <ActionButton onClick={onViewTransactions} variant="outline">
                  <RiHistoryLine className="me-2" size={18} /> Activity Logs
                </ActionButton>
              </div>

              <div className="position-absolute end-0 bottom-0 p-4 opacity-10">
                <RiNodeTree size={180} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ backgroundColor: '#fff', borderLeft: '4px solid #4f46e5 !important' }}>
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>
                  Liquidity Center
                </span>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Current Wallet</span>
                    <strong style={{ fontSize: '15px', color: '#10b981' }}>{formatCurrency(managerData?.wallet_balance)}</strong>
                  </div>
                  <div className="progress rounded-pill mb-3" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                    <div className="progress-bar rounded-pill" role="progressbar" style={{ width: '70%', backgroundColor: '#4f46e5' }} />
                  </div>
                  <p className="text-muted m-0" style={{ fontSize: '11px' }}>
                    {heroProfile?.name || "System Base"} • {heroProfile?.email || "verified_channel"}
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <ActionButton onClick={onViewWallet} variant="dark" className="w-100">
                  <RiWallet3Line className="me-2" size={16} /> Manage Wallet
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="row g-4 mb-4">
        {[
          { title: "Commission Net", value: managerData?.commission_earned, subValue: managerData?.commission_available ?? managerData?.commission_earned ?? 0, subLabel: "Available", icon: RiPieChart2Line, delta: commissionDelta.delta, color: "#6366f1" },
          { title: isMasterRole ? "Sub-Distributors" : "Distributors", value: managerData?.total_distributors, icon: RiShieldUserLine, color: "#8b5cf6" },
          { title: "Total Retailers", value: totalRetailers, icon: RiTeamLine, color: "#f59e0b" },
          { title: "Total Deposits", value: totalDeposits, icon: RiArrowRightDownLine, delta: depositDelta.delta, color: "#10b981" }
        ].map((metric, i) => (
          <div className="col-md-6 col-lg-3" key={i}>
            <MetricCard {...metric} deltaLabel="Movement" />
          </div>
        ))}
      </section>

      {/* Analytics Row */}
      <section className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: '#fff' }}>
            <div className="card-header bg-transparent border-0 p-4 pb-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Volume Momentum</h5>
                <p className="text-muted m-0 mt-1" style={{ fontSize: '12px' }}>Global commission velocity trend</p>
              </div>
              <div className="p-1 bg-light rounded-3 d-flex gap-1">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    className={`btn btn-sm border-0 rounded-2 fw-bold px-3 transition-all ${earningsRange === range ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                    onClick={() => setEarningsRange(range)}
                    style={{ fontSize: '11px', minWidth: '60px' }}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body p-4">
              <div className="mt-3" style={{ height: '220px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <polyline
                    points={toLinePoints(earningsSeries)}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {earningsSeries.map((s, i) => {
                    const points = toLinePoints(earningsSeries).split(' ');
                    const point = points[i]?.split(',');
                    if (!point) return null;
                    return <circle key={i} cx={point[0]} cy={point[1]} r="1.5" fill="#fff" stroke="#4f46e5" strokeWidth="1" />;
                  })}
                </svg>
                <div className="position-absolute w-100 border-bottom opacity-5" style={{ bottom: '0%' }}></div>
                <div className="position-absolute w-100 border-bottom opacity-5" style={{ bottom: '50%' }}></div>
              </div>
              <div className="d-flex justify-content-between mt-4">
                {earningsSeries.map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-muted d-block mb-1" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{item.label}</span>
                    <strong style={{ fontSize: '12px', color: '#1e293b' }}>{formatCurrency(item.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: '#fff' }}>
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Top Load Partners</h5>
              <p className="text-muted m-0 mt-1" style={{ fontSize: '12px' }}>Distributor asset volume distribution</p>
            </div>
            <div className="card-body p-4 d-flex flex-column gap-4">
              {distributorBars.map((bar) => {
                const max = Math.max(...distributorBars.map((b) => b.value), 1);
                const width = Math.min(100, (bar.value / max) * 100);
                return (
                  <div key={bar.name}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold text-truncate me-2" style={{ fontSize: '13px', color: '#1e293b' }}>{bar.name}</span>
                      <span className="text-primary fw-bold" style={{ fontSize: '13px' }}>{formatCurrency(bar.value)}</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', backgroundColor: '#f1f5f9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: `${width}%`, backgroundColor: '#4f46e5' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tables Row */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <div className="card-header bg-transparent border-0 p-4 pb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <RiShieldUserLine className="text-primary" size={20} />
                  <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>Managed Partner Network</h5>
                </div>
                <p className="text-muted m-0 mt-1" style={{ fontSize: '12px' }}>Real-time health of your subordinate distributors</p>
              </div>
              <div className="d-flex gap-2">
                <div className="input-group input-group-sm rounded-3 overflow-hidden shadow-none border" style={{ width: '220px' }}>
                  <span className="input-group-text bg-white border-0 opacity-50"><i className="bi bi-search py-1" /></span>
                  <input
                    type="search"
                    className="form-control border-0 py-2 shadow-none"
                    placeholder="Search partner..."
                    value={distributorSearch}
                    onChange={(e) => setDistributorSearch(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <select
                  className="form-select form-select-sm rounded-3 fw-bold ps-3 shadow-none border"
                  style={{ width: '130px', fontSize: '12px' }}
                  value={distributorFilter}
                  onChange={(e) => setDistributorFilter(e.target.value)}
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="table-responsive px-4 pb-4">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="bg-light/30">
                    <th className="py-3 border-0 bg-transparent text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Distributor Identity</th>
                    <th className="py-3 border-0 bg-transparent text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Net Assets</th>
                    <th className="py-3 border-0 bg-transparent text-muted text-uppercase text-center" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Chain size</th>
                    <th className="py-3 border-0 bg-transparent text-muted text-uppercase text-end" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors.map((distributor) => (
                    <tr key={distributor.id}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar rounded-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                            style={{ width: '38px', height: '38px', backgroundColor: '#e2e8f0', color: '#4f46e5', fontSize: '13px' }}>
                            {distributor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold mb-0" style={{ fontSize: '13px', color: '#1e293b' }}>{distributor.name}</div>
                            <small className="text-muted" style={{ fontSize: '11px' }}>{distributor.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 fw-bold" style={{ fontSize: '14px', color: '#10b981' }}>{formatCurrency(distributor.balance)}</td>
                      <td className="py-3 text-center">
                        <span className="badge bg-light text-dark border fw-bold rounded-pill px-3" style={{ fontSize: '11px' }}>
                          {distributor.total_retailers || 0} Retailers
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <span className={`badge border-0 rounded-pill px-3 py-2 ${distributor.is_active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                          style={{ fontSize: '10px' }}>
                          <span className="d-inline-block rounded-circle me-2" style={{ width: '6px', height: '6px', backgroundColor: 'currentColor' }} />
                          {distributor.is_active ? "Live access" : "Revoked"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DARK ACTIVITY LOGS SECTION */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-xl rounded-4 overflow-hidden"
            style={{ backgroundColor: '#0f172a', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div className="card-header border-0 p-4 pb-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <div>
                <div className="d-flex align-items-center gap-2 text-white">
                  <RiHistoryLine className="text-primary" size={20} />
                  <h5 className="fw-bold m-0">Channel Audit Logs</h5>
                </div>
                <p className="text-white-50 m-0 mt-1" style={{ fontSize: '12px' }}>Real-time transaction auditing for all subordinate entities</p>
              </div>
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm bg-dark text-white border-0 rounded-3 fw-bold ps-3 shadow-none"
                  style={{ width: '160px', fontSize: '12px', backgroundColor: '#1e293b', color: '#ffffff' }}
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                >
                  <option value="all" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Audit: All Type</option>
                  <option value="deposit" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Deposits</option>
                  <option value="commission" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Commission</option>
                  <option value="withdraw" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Withdrawals</option>
                </select>
                <ActionButton variant="secondary" className="btn-sm px-3" onClick={onViewTransactions} style={{ height: '31px' }}>
                  <RiDownload2Line className="me-1" size={14} /> CSV
                </ActionButton>
              </div>
            </div>

            <div className="table-responsive px-4 pb-4">
              <table className="table table-hover align-middle mb-0 border-0">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <th className="py-3 border-0 text-white-50 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Execution Date</th>
                    <th className="py-3 border-0 text-white-50 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Commission</th>
                    <th className="py-3 border-0 text-white-50 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Source Entity</th>
                    <th className="py-3 border-0 text-white-50 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Volume</th>
                    <th className="py-3 border-0 text-white-50 text-uppercase text-end" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Audit Ref</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }} className="border-0">
                      <td className="py-3 text-white-50 fw-medium border-0" style={{ fontSize: '12px' }}>{formatDate(tx.created_at)}</td>
                      <td className="py-3 fw-bold border-0" style={{ fontSize: '13px', color: tx.commission_amount > 0 ? '#818cf8' : '#94a3b8' }}>
                        {tx.commission_amount > 0 ? `+${formatCurrency(tx.commission_amount)}` : '-'}
                      </td>
                      <td className="py-3 border-0" style={{ backgroundColor: 'transparent !important' }}>
                        <div style={{ fontSize: '13px', color: '#f8fafc' }} className="fw-bold">
                          {tx.super_distributor_name || tx.distributor_name || "System Base"}
                        </div>
                        <div className="text-white-50" style={{ fontSize: '11px' }}>via {tx.retailer_name || "Self"}</div>
                      </td>
                      <td className="py-3 fw-semibold border-0" style={{ fontSize: '13px' }}>
                        {formatCurrency(tx.deposit_amount ?? tx.original_amount ?? tx.amount ?? 0)}
                      </td>
                      <td className="py-3 text-end border-0">
                        <span className="badge bg-white/10 text-white-50 fw-normal rounded-1 px-2 py-1" style={{ fontSize: '10px' }}>
                          {tx.description || tx.reference || tx.type || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDistributorDashboardSection;
