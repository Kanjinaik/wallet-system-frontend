import React, { useCallback, useMemo, useState } from "react";
import { formatCurrency } from "./constants";

const EMPTY_LIST = [];
const defaultFn = () => { };

const DistributorDashboardSection = ({
  activeSection,
  distributorData,
  distributorPerformance,
  recentTransactions = [],
  transactions = [],
  onViewTransactions = defaultFn,
  onViewWallet = defaultFn,
  onManageUsers = defaultFn,
  onViewWithdrawRequests = defaultFn,
}) => {
  const [earningsRange, setEarningsRange] = useState("week");
  const [retailerFilter, setRetailerFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [retailerSearch, setRetailerSearch] = useState("");

  const sourceTransactions = transactions.length ? transactions : recentTransactions;
  const retailers = distributorData?.retailers || EMPTY_LIST;

  const commissionTransactions = useMemo(
    () => sourceTransactions.filter((tx) => tx.commission_amount != null || String(tx.type || "").toLowerCase().includes("commission")),
    [sourceTransactions]
  );

  const sumInWindow = (items, start, end, picker) =>
    items.reduce((sum, item) => {
      const dt = new Date(item.created_at || item.date || item.createdAt);
      if (Number.isNaN(dt.getTime())) return sum;
      if (dt >= start && dt < end) {
        const amount = Number(picker(item));
        return sum + (Number.isFinite(amount) ? amount : 0);
      }
      return sum;
    }, 0);

  const buildWindowDelta = useCallback((items, picker, daysBack = 7) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - daysBack);
    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - daysBack);
    const current = sumInWindow(items, start, end, picker);
    const previous = sumInWindow(items, prevStart, start, picker);
    const delta = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
    return { current, previous, delta: Math.round(delta) };
  }, []);

  const commissionDelta = useMemo(
    () => buildWindowDelta(commissionTransactions, (tx) => tx.commission_amount ?? tx.amount ?? 0),
    [buildWindowDelta, commissionTransactions]
  );

  const totalDeposits = useMemo(
    () =>
      sourceTransactions.reduce((sum, tx) => {
        const amount = Number(tx.deposit_amount ?? tx.amount ?? 0);
        const type = String(tx.type || "").toLowerCase();
        const desc = String(tx.description || "").toLowerCase();
        const isDeposit = type.includes("deposit") || desc.includes("deposit") || amount > 0;
        return isDeposit ? sum + (Number.isFinite(amount) ? amount : 0) : sum;
      }, 0),
    [sourceTransactions]
  );

  const depositDelta = useMemo(
    () => buildWindowDelta(sourceTransactions, (tx) => tx.deposit_amount ?? tx.amount ?? 0),
    [buildWindowDelta, sourceTransactions]
  );

  const earningsSeries = useMemo(() => {
    const buckets = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sliceAmount = (start, end) => sumInWindow(
      commissionTransactions,
      start,
      end,
      (tx) => tx.commission_amount ?? tx.amount ?? 0
    );

    if (earningsRange === "month") {
      for (let i = 5; i >= 0; i -= 1) {
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
      for (let i = 5; i >= 0; i -= 1) {
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

    for (let i = 6; i >= 0; i -= 1) {
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

  const retailerBars = useMemo(() => {
    const totals = new Map();
    sourceTransactions.forEach((tx) => {
      const retailerName = tx.retailer_name || tx.retailer || tx.created_by_retailer || tx.user?.name || "Retailer";
      const amount = Number(tx.deposit_amount ?? tx.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) return;
      totals.set(retailerName, (totals.get(retailerName) || 0) + amount);
    });
    retailers.forEach((retailer) => {
      if (!totals.has(retailer.name)) {
        totals.set(retailer.name, Number(retailer.balance || 0));
      }
    });
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sourceTransactions, retailers]);

  const topRetailers = useMemo(
    () =>
      [...retailerBars]
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
    [retailerBars]
  );

  const filteredRetailers = useMemo(() => {
    const term = retailerSearch.trim().toLowerCase();
    return retailers.filter((retailer) => {
      if (retailerFilter === "active" && !retailer.is_active) return false;
      if (retailerFilter === "inactive" && retailer.is_active) return false;
      if (!term) return true;
      const lookup = `${retailer.name} ${retailer.email} ${retailer.phone}`.toLowerCase();
      return lookup.includes(term);
    });
  }, [retailers, retailerFilter, retailerSearch]);

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

  if (activeSection !== "dashboard") {
    return null;
  }

  return (
    <div className="manager-shell">
      <section className="manager-hero">
        <div className="manager-hero-meta">
          <span className="manager-crumb">Distributor</span>
          <h3>Growth cockpit</h3>
          <p>Track retailer activity, commission movement, and wallet health from one dashboard.</p>
          <div className="manager-hero-actions">
            <button type="button" onClick={onManageUsers}>Add Retailer</button>
            <button type="button" className="ghost" onClick={onViewTransactions}>View Transactions</button>
          </div>
        </div>
        <div className="manager-hero-balance">
          <span>Commission Earned</span>
          <strong>{formatCurrency(distributorData?.commission_earned)}</strong>
          <small>Available to withdraw: {formatCurrency(distributorData?.commission_available ?? distributorData?.commission_earned ?? 0)}</small>
        </div>
      </section>

      <section className="manager-metric-grid">
        <div className="manager-metric purple">
          <div className="metric-label">Commission Earned</div>
          <div className="metric-value">{formatCurrency(distributorData?.commission_earned)}</div>
          <div className="metric-delta positive">+{commissionDelta.delta}% this week</div>
        </div>
        <div className="manager-metric teal">
          <div className="metric-label">Total Retailers</div>
          <div className="metric-value">{distributorData?.total_retailers || 0}</div>
          <div className="metric-delta muted">Active network</div>
        </div>
        <div className="manager-metric amber">
          <div className="metric-label">Total Bonus</div>
          <div className="metric-value">{formatCurrency(distributorPerformance?.bonus?.total_bonus)}</div>
          <div className="metric-delta muted">Mapped incentives</div>
        </div>
        <div className="manager-metric sunset">
          <div className="metric-label">Total Deposits</div>
          <div className="metric-value">{formatCurrency(totalDeposits)}</div>
          <div className={`metric-delta ${depositDelta.delta >= 0 ? "positive" : "negative"}`}>
            {depositDelta.delta >= 0 ? "+" : ""}
            {depositDelta.delta}% vs prev week
          </div>
        </div>
      </section>

      <section className="manager-analytics">
        <header className="manager-analytics-head">
          <div>
            <p>Analytics Overview</p>
            <strong>Earnings, deposits, and retailer momentum</strong>
          </div>
          <div className="manager-actions">
            <button type="button" onClick={onManageUsers}>+ Add Retailer</button>
            <button type="button" onClick={onViewWithdrawRequests}>+ View Withdraws</button>
          </div>
        </header>

        <div className="manager-analytics-grid">
          <article className="manager-card">
            <div className="manager-card-head">
              <span>Earnings Overview</span>
              <div className="segmented">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    className={earningsRange === range ? "active" : ""}
                    onClick={() => setEarningsRange(range)}
                    type="button"
                  >
                    {range === "day" ? "Day" : range === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>
            <div className="manager-line">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline points={toLinePoints(earningsSeries)} />
              </svg>
              <div className="manager-line-meta">
                {earningsSeries.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="manager-card">
            <div className="manager-card-head">
              <span>Deposits by Retailers</span>
              <button className="pill" type="button" onClick={onViewWallet}>Wallet</button>
            </div>
            <div className="manager-bars">
              {retailerBars.map((bar) => {
                const max = Math.max(...retailerBars.map((b) => b.value), 1);
                const width = Math.min(100, (bar.value / max) * 100);
                return (
                  <div key={bar.name} className="manager-bar">
                    <div className="label">
                      <span>{bar.name}</span>
                      <strong>{formatCurrency(bar.value)}</strong>
                    </div>
                    <div className="track">
                      <span style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
              {!retailerBars.length && <div className="muted">No retailer activity yet.</div>}
            </div>
          </article>

          <article className="manager-card">
            <div className="manager-card-head">
              <span>Top Retailers</span>
              <button className="pill ghost" type="button" onClick={onManageUsers}>View All</button>
            </div>
            <div className="manager-retailers">
              {topRetailers.map((retailer, idx) => (
                <div key={retailer.name} className="retailer-row">
                  <div className="retailer-rank">{idx + 1}</div>
                  <div className="retailer-meta">
                    <strong>{retailer.name}</strong>
                    <small>{formatCurrency(retailer.value)} volume</small>
                  </div>
                </div>
              ))}
              {!topRetailers.length && <div className="muted">Waiting for the first retailer transaction.</div>}
            </div>
          </article>
        </div>
      </section>

      <div className="manager-table-grid">
        <section className="manager-table">
          <header>
            <div>
              <p>Recent Retailers</p>
              <strong>Onboarded retailers and their wallet health</strong>
            </div>
            <div className="table-controls">
              <select value={retailerFilter} onChange={(e) => setRetailerFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input
                type="search"
                placeholder="Search by name"
                value={retailerSearch}
                onChange={(e) => setRetailerSearch(e.target.value)}
              />
            </div>
          </header>
          <div className="table-scroll">
            <table className="role-table manager">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Mobile</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRetailers.map((retailer) => (
                  <tr key={retailer.id}>
                    <td>{retailer.name}</td>
                    <td>{retailer.email}</td>
                    <td>{formatCurrency(retailer.balance)}</td>
                    <td>{retailer.phone || "-"}</td>
                    <td>
                      <span className={`status-pill ${retailer.is_active ? "success" : "muted"}`}>
                        {retailer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filteredRetailers.length && (
                  <tr>
                    <td colSpan="5" className="muted">No retailers found for this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="manager-table">
          <header>
            <div>
              <p>Transaction History</p>
              <strong>Latest wallet and commission movements</strong>
            </div>
            <div className="table-controls">
              <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="deposit">Deposits</option>
                <option value="commission">Commission</option>
                <option value="withdraw">Withdrawals</option>
              </select>
              <button type="button" className="pill ghost" onClick={onViewTransactions}>Export / View All</button>
            </div>
          </header>
          <div className="table-scroll">
            <table className="role-table manager">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commission</th>
                  <th>Retailer</th>
                  <th>Deposit Amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.created_at)}</td>
                    <td>{formatCurrency(tx.commission_amount ?? 0)}</td>
                    <td>{tx.retailer_name || tx.retailer || tx.created_by_retailer || "-"}</td>
                    <td>{formatCurrency(tx.deposit_amount ?? tx.original_amount ?? tx.amount ?? 0)}</td>
                    <td>{tx.description || tx.reference || tx.type || "-"}</td>
                  </tr>
                ))}
                {!filteredTransactions.length && (
                  <tr>
                    <td colSpan="5" className="muted">No transactions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DistributorDashboardSection;
