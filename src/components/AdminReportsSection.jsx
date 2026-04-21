import React, { useMemo, useState } from "react";
import { formatCurrency } from "./constants";
import { downloadCsv } from "./roleDashboardHelpers";

const SUCCESS_STATUSES = ["completed", "success", "approved", "processed"];
const PENDING_STATUSES = ["pending", "processing", "initiated"];
const FAILED_STATUSES = ["failed", "rejected", "cancelled", "declined", "error"];

const toNum = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfWeek = (date) => {
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const d = new Date(date);
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
};
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);

const toDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const statusGroup = (status) => {
  const normalized = String(status || "completed").toLowerCase();
  if (SUCCESS_STATUSES.includes(normalized)) return "success";
  if (PENDING_STATUSES.includes(normalized)) return "pending";
  if (FAILED_STATUSES.includes(normalized)) return "failed";
  return "other";
};

const typeGroup = (tx) => {
  const rawType = String(tx.type || "").toLowerCase();
  const desc = String(tx.description || "").toLowerCase();
  if (rawType.includes("deposit") || rawType.includes("payin") || desc.includes("deposit")) return "deposit";
  if (rawType.includes("withdraw") || rawType.includes("payout") || desc.includes("withdraw")) return "withdraw";
  if (rawType.includes("refund") || desc.includes("refund")) return "refund";
  if (rawType.includes("commission") || desc.includes("commission")) return "commission";
  if (rawType.includes("transfer")) return "transfer";
  return "other";
};

const paymentMethodLabel = (tx) => {
  const metadataMethod = tx?.metadata?.payment_method;
  if (metadataMethod) {
    return String(metadataMethod).toUpperCase().replaceAll("_", " ");
  }
  const desc = String(tx?.description || "").toLowerCase();
  if (desc.includes("upi")) return "UPI";
  if (desc.includes("card") || desc.includes("credit") || desc.includes("debit")) return "CARD";
  if (desc.includes("bank")) return "BANK TRANSFER";
  if (desc.includes("wallet")) return "WALLET";
  return "UNKNOWN";
};

const trendSeries = (items, months = 6) => {
  const now = new Date();
  const points = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      key,
      label: cursor.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      deposit: 0,
      withdraw: 0,
      revenue: 0,
      commission: 0,
      users: 0,
    });
  }

  const pointMap = new Map(points.map((point) => [point.key, point]));

  items.forEach((tx) => {
    const d = toDate(tx.created_at);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = pointMap.get(key);
    if (!point) return;

    const amount = toNum(tx.amount);
    const tType = typeGroup(tx);
    const fee = toNum(tx?.metadata?.withdrawal_fee);

    if (tType === "deposit") point.deposit += amount;
    if (tType === "withdraw") point.withdraw += amount;
    if (tType === "commission") point.commission += amount;
    point.revenue += fee;
  });

  return points;
};

const BarChart = ({ rows, valueKey, colorClass }) => {
  const max = rows.reduce((highest, row) => Math.max(highest, toNum(row[valueKey])), 0) || 1;

  return (
    <div className="report-bars">
      {rows.map((row) => {
        const value = toNum(row[valueKey]);
        const height = Math.max(8, Math.round((value / max) * 120));
        return (
          <div key={`${valueKey}-${row.label}`} className="report-bar-col" title={`${row.label}: ${formatCurrency(value)}`}>
            <div className={`report-bar ${colorClass}`} style={{ height: `${height}px` }} />
            <span>{row.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const PieLegend = ({ rows, total }) => (
  <div className="report-pie-legend">
    {rows.map((row, index) => {
      const pct = total > 0 ? ((toNum(row.amount) / total) * 100).toFixed(1) : "0.0";
      return (
        <div key={`${row.label}-${index}`} className="report-pie-item">
          <span className={`report-dot dot-${(index % 5) + 1}`} />
          <span>{row.label}</span>
          <strong>{pct}%</strong>
        </div>
      );
    })}
  </div>
);

const exportTableToExcel = (tableId, name) => {
  const table = document.getElementById(tableId);
  if (!table) return;
  const html = table.outerHTML.replace(/ /g, "%20");
  const link = document.createElement("a");
  link.href = `data:application/vnd.ms-excel,${html}`;
  link.download = `${name}_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
};

const AdminReportsSection = ({
  role,
  activeSection,
  adminStats,
  adminUsers,
  transactions,
  isLive,
  liveIntervalSec,
  reportFilters,
  onReportFilterChange,
  onResetFilters,
  onToggleLive,
  onLiveIntervalChange,
}) => {
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredTransactions = useMemo(() => {
    const fromDate = reportFilters.dateFrom ? startOfDay(new Date(reportFilters.dateFrom)) : null;
    const toDateRaw = reportFilters.dateTo ? startOfDay(new Date(reportFilters.dateTo)) : null;
    const toDateExclusive = toDateRaw ? new Date(toDateRaw.getFullYear(), toDateRaw.getMonth(), toDateRaw.getDate() + 1) : null;

    return transactions.filter((tx) => {
      const d = toDate(tx.created_at);
      if (!d) return false;

      if (fromDate && d < fromDate) return false;
      if (toDateExclusive && d >= toDateExclusive) return false;

      const groupedType = typeGroup(tx);
      const groupedStatus = statusGroup(tx.status);
      const txUserId = String(tx.user_id || tx.user?.id || "");
      const txMethod = paymentMethodLabel(tx);

      if (reportFilters.userId !== "all" && String(reportFilters.userId) !== txUserId) return false;
      if (reportFilters.transactionType !== "all" && reportFilters.transactionType !== groupedType) return false;
      if (reportFilters.status !== "all" && reportFilters.status !== groupedStatus) return false;
      if (reportFilters.paymentMethod !== "all" && reportFilters.paymentMethod !== txMethod) return false;

      return true;
    });
  }, [transactions, reportFilters]);

  const reportData = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const usersById = new Map(adminUsers.map((u) => [String(u.id), u]));

    const totals = {
      depositToday: 0,
      withdrawalToday: 0,
      totalCommission: toNum(adminStats?.total_commission),
      totalRevenue: 0,
      pendingWithdrawals: 0,
      failedTransactions: 0,
      refundAmount: 0,
      netProfit: 0,
      totalTransactions: filteredTransactions.length,
      successfulTransactions: 0,
      pendingTransactions: 0,
      failedTxAnalytics: 0,
      totalAmount: 0,
      highestTransaction: 0,
      dailyDeposit: 0,
      weeklyDeposit: 0,
      monthlyDeposit: 0,
      totalWithdrawals: 0,
      approvedWithdrawals: 0,
      rejectedWithdrawals: 0,
      withdrawalAmountSum: 0,
      suspiciousTransactions: 0,
      largeWithdrawals: 0,
      accountLockAlerts: 0,
      multiFailedUsers: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
    };

    const paymentStatsMap = new Map();
    const paymentRevenueMap = new Map();
    const userDepositMap = new Map();
    const userWithdrawMap = new Map();
    const userActivityMap = new Map();
    const agentRevenueMap = new Map();
    const agentCommissionMap = new Map();
    const failedByUser = new Map();
    const heatMap = Array.from({ length: 7 }, () => Array.from({ length: 6 }, () => 0));

    filteredTransactions.forEach((tx) => {
      const amount = toNum(tx.amount);
      const d = toDate(tx.created_at);
      if (!d) return;

      const groupedType = typeGroup(tx);
      const groupedStatus = statusGroup(tx.status);
      const txUser = usersById.get(String(tx.user_id || tx.user?.id || "")) || tx.user;
      const userName = txUser?.name || `User ${tx.user_id || "N/A"}`;
      const userRole = txUser?.role || "unknown";
      const method = paymentMethodLabel(tx);
      const withdrawFee = toNum(tx?.metadata?.withdrawal_fee);

      totals.totalAmount += amount;
      totals.highestTransaction = Math.max(totals.highestTransaction, amount);

      if (groupedStatus === "success") totals.successfulTransactions += 1;
      if (groupedStatus === "pending") totals.pendingTransactions += 1;
      if (groupedStatus === "failed") {
        totals.failedTransactions += 1;
        totals.failedTxAnalytics += 1;
        const current = failedByUser.get(userName) || 0;
        failedByUser.set(userName, current + 1);
      }

      if (groupedType === "refund") {
        totals.refundAmount += amount;
      }

      if (groupedType === "deposit") {
        if (d >= dayStart) totals.depositToday += amount;
        if (d >= dayStart) totals.dailyDeposit += amount;
        if (d >= weekStart) totals.weeklyDeposit += amount;
        if (d >= monthStart) totals.monthlyDeposit += amount;

        const current = userDepositMap.get(userName) || 0;
        userDepositMap.set(userName, current + amount);
      }

      if (groupedType === "withdraw") {
        totals.totalWithdrawals += amount;
        totals.withdrawalAmountSum += amount;
        if (d >= dayStart) totals.withdrawalToday += amount;
        if (groupedStatus === "pending") totals.pendingWithdrawals += 1;
        if (groupedStatus === "success") totals.approvedWithdrawals += 1;
        if (groupedStatus === "failed") totals.rejectedWithdrawals += 1;
        if (amount >= 50000) totals.largeWithdrawals += 1;

        const current = userWithdrawMap.get(userName) || 0;
        userWithdrawMap.set(userName, current + amount);
      }

      const pCurrent = paymentStatsMap.get(method) || { transactions: 0, amount: 0 };
      paymentStatsMap.set(method, {
        transactions: pCurrent.transactions + 1,
        amount: pCurrent.amount + amount,
      });

      const pRevenueCurrent = paymentRevenueMap.get(method) || 0;
      paymentRevenueMap.set(method, pRevenueCurrent + withdrawFee);

      if (withdrawFee > 0) {
        totals.totalRevenue += withdrawFee;
        if (d >= dayStart) totals.dailyRevenue += withdrawFee;
        if (d >= monthStart) totals.monthlyRevenue += withdrawFee;
        if (d >= yearStart) totals.yearlyRevenue += withdrawFee;

        const agentRev = agentRevenueMap.get(userRole) || 0;
        agentRevenueMap.set(userRole, agentRev + withdrawFee);
      }

      if (groupedType === "commission") {
        const comm = agentCommissionMap.get(userRole) || { transactions: 0, amount: 0 };
        agentCommissionMap.set(userRole, {
          transactions: comm.transactions + 1,
          amount: comm.amount + amount,
        });
      }

      const activity = userActivityMap.get(userName) || 0;
      userActivityMap.set(userName, activity + 1);

      if (groupedStatus === "failed" || amount >= 100000) {
        totals.suspiciousTransactions += 1;
      }

      const weekday = d.getDay();
      const slot = Math.floor(d.getHours() / 4);
      heatMap[weekday][slot] += 1;
    });

    const userRows = adminUsers.map((u) => {
      const balance = toNum(u.wallets_sum_balance);
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        deposits: toNum(userDepositMap.get(u.name)),
        withdrawals: toNum(userWithdrawMap.get(u.name)),
        balance,
        activity: toNum(userActivityMap.get(u.name)),
        isActive: Boolean(u.is_active),
      };
    });

    totals.netProfit = totals.totalRevenue + totals.totalCommission - totals.refundAmount;
    totals.multiFailedUsers = Array.from(failedByUser.values()).filter((count) => count >= 3).length;
    totals.accountLockAlerts = adminUsers.filter((u) => !u.is_active).length;

    const activeUsers = adminUsers.filter((u) => u.is_active).length;
    const inactiveUsers = adminUsers.length - activeUsers;

    const todayDateStr = now.toISOString().slice(0, 10);
    const monthPrefix = todayDateStr.slice(0, 7);
    const newUsersToday = adminUsers.filter((u) => String(u.created_at || "").slice(0, 10) === todayDateStr).length;
    const newUsersThisMonth = adminUsers.filter((u) => String(u.created_at || "").slice(0, 7) === monthPrefix).length;

    const onlineUsers = adminUsers.filter((u) => {
      const lastLogin = toDate(u.last_login_at || u.updated_at);
      if (!lastLogin) return false;
      return now.getTime() - lastLogin.getTime() <= 5 * 60 * 1000;
    }).length;

    const topDepositUsers = [...userRows].sort((a, b) => b.deposits - a.deposits).slice(0, 5);
    const topWithdrawalUsers = [...userRows].sort((a, b) => b.withdrawals - a.withdrawals).slice(0, 5);
    const mostActiveUsers = [...userRows].sort((a, b) => b.activity - a.activity).slice(0, 5);
    const highestBalanceUsers = [...userRows].sort((a, b) => b.balance - a.balance).slice(0, 5);

    const paymentRows = Array.from(paymentStatsMap.entries()).map(([label, payload]) => ({
      label,
      transactions: payload.transactions,
      amount: payload.amount,
    }));

    const paymentRevenueRows = Array.from(paymentRevenueMap.entries()).map(([label, amount]) => ({ label, amount }));

    const commissionRows = Array.from(agentCommissionMap.entries()).map(([agent, payload]) => ({
      agent,
      transactions: payload.transactions,
      commission: payload.amount,
      commissionPerTransaction: payload.transactions > 0 ? payload.amount / payload.transactions : 0,
    }));

    const revenueByAgentRows = Array.from(agentRevenueMap.entries()).map(([agent, amount]) => ({ agent, amount }));

    const monthly = trendSeries(filteredTransactions, 6);

    const revenueGrowthRate = monthly.length >= 2
      ? (() => {
          const prev = toNum(monthly[monthly.length - 2].revenue);
          const current = toNum(monthly[monthly.length - 1].revenue);
          if (prev === 0) return current > 0 ? 100 : 0;
          return ((current - prev) / prev) * 100;
        })()
      : 0;

    const predictedProfit = monthly.reduce((sum, m) => sum + toNum(m.revenue), 0) / Math.max(monthly.length, 1) + totals.totalCommission * 0.02;

    const agentPerformanceRanking = [...userRows]
      .filter((r) => ["distributor", "super_distributor", "master_distributor"].includes(String(r.role || "")))
      .map((r) => ({
        name: r.name,
        score: r.activity * 4 + r.deposits * 0.003 + r.balance * 0.001,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      totals,
      activeUsers,
      inactiveUsers,
      newUsersToday,
      newUsersThisMonth,
      onlineUsers,
      topDepositUsers,
      topWithdrawalUsers,
      mostActiveUsers,
      highestBalanceUsers,
      paymentRows,
      paymentRevenueRows,
      commissionRows,
      revenueByAgentRows,
      monthly,
      heatMap,
      revenueGrowthRate,
      predictedProfit,
      agentPerformanceRanking,
      userRows,
    };
  }, [adminStats, adminUsers, filteredTransactions]);

  const onApplyCustomRange = () => {
    onReportFilterChange("dateFrom", customStart || "");
    onReportFilterChange("dateTo", customEnd || "");
  };

  const onQuickRange = (period) => {
    const now = new Date();
    if (period === "daily") {
      const day = now.toISOString().slice(0, 10);
      onReportFilterChange("dateFrom", day);
      onReportFilterChange("dateTo", day);
      return;
    }
    if (period === "weekly") {
      const from = startOfWeek(now).toISOString().slice(0, 10);
      onReportFilterChange("dateFrom", from);
      onReportFilterChange("dateTo", now.toISOString().slice(0, 10));
      return;
    }
    if (period === "monthly") {
      const from = startOfMonth(now).toISOString().slice(0, 10);
      onReportFilterChange("dateFrom", from);
      onReportFilterChange("dateTo", now.toISOString().slice(0, 10));
      return;
    }
    if (period === "yearly") {
      const from = startOfYear(now).toISOString().slice(0, 10);
      onReportFilterChange("dateFrom", from);
      onReportFilterChange("dateTo", now.toISOString().slice(0, 10));
      return;
    }
    onReportFilterChange("dateFrom", "");
    onReportFilterChange("dateTo", "");
  };

  const handleExportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Deposits Today", reportData.totals.depositToday],
      ["Total Withdrawals Today", reportData.totals.withdrawalToday],
      ["Total Commission", reportData.totals.totalCommission],
      ["Total Revenue", reportData.totals.totalRevenue],
      ["Net Profit", reportData.totals.netProfit],
      ["Active Users", reportData.activeUsers],
      ["Failed Transactions", reportData.totals.failedTransactions],
    ];
    downloadCsv(rows, `admin_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (role !== "admin" || activeSection !== "dashboard") {
    return null;
  }

  const paymentTotal = reportData.paymentRows.reduce((sum, row) => sum + toNum(row.amount), 0);

  return (
    <section className="role-panel role-reports-panel">
      <div className="report-header-row">
        <div>
          <h4>Reports Panel</h4>
          <p>Live business metrics, analytics, exports, fraud checks, and BI intelligence.</p>
        </div>
        <div className="report-live-tools">
          <label>
            <span>Live</span>
            <input type="checkbox" checked={isLive} onChange={onToggleLive} />
          </label>
          <select value={String(liveIntervalSec)} onChange={(e) => onLiveIntervalChange(Number(e.target.value))}>
            <option value="10">10s</option>
            <option value="20">20s</option>
            <option value="30">30s</option>
            <option value="60">60s</option>
          </select>
          <button type="button" onClick={handleExportCsv}>CSV</button>
          <button type="button" onClick={() => exportTableToExcel("report-main-table", "admin_report")}>Excel</button>
          <button type="button" onClick={() => window.print()}>PDF / Print</button>
        </div>
      </div>

      <article className="report-filter-card">
        <h5>Advanced Filters</h5>
        <div className="report-filters-grid">
          <label>
            Date From
            <input type="date" value={reportFilters.dateFrom} onChange={(e) => onReportFilterChange("dateFrom", e.target.value)} />
          </label>
          <label>
            Date To
            <input type="date" value={reportFilters.dateTo} onChange={(e) => onReportFilterChange("dateTo", e.target.value)} />
          </label>
          <label>
            User
            <select value={reportFilters.userId} onChange={(e) => onReportFilterChange("userId", e.target.value)}>
              <option value="all">All Users</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          <label>
            Transaction Type
            <select value={reportFilters.transactionType} onChange={(e) => onReportFilterChange("transactionType", e.target.value)}>
              <option value="all">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Payment Method
            <select value={reportFilters.paymentMethod} onChange={(e) => onReportFilterChange("paymentMethod", e.target.value)}>
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="BANK TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="WALLET">Wallet</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </label>
          <label>
            Status
            <select value={reportFilters.status} onChange={(e) => onReportFilterChange("status", e.target.value)}>
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>
        <div className="report-quick-range">
          <button type="button" onClick={() => onQuickRange("daily")}>Daily</button>
          <button type="button" onClick={() => onQuickRange("weekly")}>Weekly</button>
          <button type="button" onClick={() => onQuickRange("monthly")}>Monthly</button>
          <button type="button" onClick={() => onQuickRange("yearly")}>Yearly</button>
          <button type="button" onClick={() => onQuickRange("all")}>All Time</button>
          <button type="button" className="ghost" onClick={onResetFilters}>Reset</button>
        </div>
        <div className="report-custom-range">
          <label>
            Custom Start
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </label>
          <label>
            Custom End
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </label>
          <button type="button" onClick={onApplyCustomRange}>Apply Custom Date Range</button>
        </div>
      </article>

      <div className="role-stat-grid report-stat-grid-extended">
        <div className="role-stat-card blue"><span>Total Deposits Today</span><strong>{formatCurrency(reportData.totals.depositToday)}</strong></div>
        <div className="role-stat-card indigo"><span>Total Withdrawals Today</span><strong>{formatCurrency(reportData.totals.withdrawalToday)}</strong></div>
        <div className="role-stat-card teal"><span>Total Commission Earned</span><strong>{formatCurrency(reportData.totals.totalCommission)}</strong></div>
        <div className="role-stat-card gold"><span>Total Revenue</span><strong>{formatCurrency(reportData.totals.totalRevenue)}</strong></div>
        <div className="role-stat-card pink"><span>Pending Withdrawals</span><strong>{reportData.totals.pendingWithdrawals}</strong></div>
        <div className="role-stat-card indigo"><span>Failed Transactions</span><strong>{reportData.totals.failedTransactions}</strong></div>
        <div className="role-stat-card teal"><span>Refund Amount</span><strong>{formatCurrency(reportData.totals.refundAmount)}</strong></div>
        <div className="role-stat-card green"><span>Net Profit</span><strong>{formatCurrency(reportData.totals.netProfit)}</strong></div>
      </div>

      <div className="role-content-grid">
        <article className="role-panel">
          <h5>Transaction Analytics</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Total Transactions</th><td>{reportData.totals.totalTransactions}</td></tr>
              <tr><th>Successful Transactions</th><td>{reportData.totals.successfulTransactions}</td></tr>
              <tr><th>Failed Transactions</th><td>{reportData.totals.failedTxAnalytics}</td></tr>
              <tr><th>Pending Transactions</th><td>{reportData.totals.pendingTransactions}</td></tr>
              <tr><th>Average Transaction Amount</th><td>{formatCurrency(reportData.totals.totalTransactions ? reportData.totals.totalAmount / reportData.totals.totalTransactions : 0)}</td></tr>
              <tr><th>Highest Transaction</th><td>{formatCurrency(reportData.totals.highestTransaction)}</td></tr>
            </tbody>
          </table>
        </article>

        <article className="role-panel">
          <h5>Deposit & Withdrawal Report</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Daily Deposit</th><td>{formatCurrency(reportData.totals.dailyDeposit)}</td></tr>
              <tr><th>Weekly Deposit</th><td>{formatCurrency(reportData.totals.weeklyDeposit)}</td></tr>
              <tr><th>Monthly Deposit</th><td>{formatCurrency(reportData.totals.monthlyDeposit)}</td></tr>
              <tr><th>Total Withdrawals</th><td>{formatCurrency(reportData.totals.totalWithdrawals)}</td></tr>
              <tr><th>Pending Withdrawals</th><td>{reportData.totals.pendingWithdrawals}</td></tr>
              <tr><th>Approved Withdrawals</th><td>{reportData.totals.approvedWithdrawals}</td></tr>
              <tr><th>Rejected Withdrawals</th><td>{reportData.totals.rejectedWithdrawals}</td></tr>
              <tr><th>Average Withdrawal Amount</th><td>{formatCurrency(reportData.totals.totalWithdrawals ? reportData.totals.withdrawalAmountSum / Math.max(reportData.totals.approvedWithdrawals + reportData.totals.pendingWithdrawals + reportData.totals.rejectedWithdrawals, 1) : 0)}</td></tr>
            </tbody>
          </table>
        </article>
      </div>

      <div className="role-content-grid">
        <article className="role-panel">
          <h5>User Activity Report</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Total Users</th><td>{adminUsers.length}</td></tr>
              <tr><th>Active Users</th><td>{reportData.activeUsers}</td></tr>
              <tr><th>New Users Today</th><td>{reportData.newUsersToday}</td></tr>
              <tr><th>New Users This Month</th><td>{reportData.newUsersThisMonth}</td></tr>
              <tr><th>Online Users</th><td>{reportData.onlineUsers}</td></tr>
              <tr><th>Inactive Users</th><td>{reportData.inactiveUsers}</td></tr>
            </tbody>
          </table>
        </article>

        <article className="role-panel">
          <h5>Commission Analytics</h5>
          <table className="role-table">
            <thead>
              <tr><th>Agent</th><th>Transactions</th><th>Commission</th><th>Per Transaction</th></tr>
            </thead>
            <tbody>
              {reportData.commissionRows.length ? reportData.commissionRows.map((row) => (
                <tr key={row.agent}>
                  <td>{row.agent}</td>
                  <td>{row.transactions}</td>
                  <td>{formatCurrency(row.commission)}</td>
                  <td>{formatCurrency(row.commissionPerTransaction)}</td>
                </tr>
              )) : (
                <tr><td colSpan={4}>No commission transactions in selected range.</td></tr>
              )}
            </tbody>
          </table>
        </article>
      </div>

      <div className="role-content-grid">
        <article className="role-panel">
          <h5>Revenue Analytics</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Daily Revenue</th><td>{formatCurrency(reportData.totals.dailyRevenue)}</td></tr>
              <tr><th>Monthly Revenue</th><td>{formatCurrency(reportData.totals.monthlyRevenue)}</td></tr>
              <tr><th>Yearly Revenue</th><td>{formatCurrency(reportData.totals.yearlyRevenue)}</td></tr>
            </tbody>
          </table>
          <h6 className="mt-3">Revenue by Payment Method</h6>
          <table className="role-table">
            <thead>
              <tr><th>Payment Method</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {reportData.paymentRevenueRows.map((row) => (
                <tr key={row.label}><td>{row.label}</td><td>{formatCurrency(row.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="role-panel">
          <h5>Payment Analytics</h5>
          <table className="role-table">
            <thead>
              <tr><th>Payment Method</th><th>Transactions</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {reportData.paymentRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.transactions}</td>
                  <td>{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PieLegend rows={reportData.paymentRows} total={paymentTotal} />
        </article>
      </div>

      <article className="role-panel">
        <h5>Graph Reports</h5>
        <div className="report-chart-grid">
          <div>
            <h6>Deposit vs Withdrawal Chart</h6>
            <BarChart rows={reportData.monthly} valueKey="deposit" colorClass="bar-deposit" />
            <BarChart rows={reportData.monthly} valueKey="withdraw" colorClass="bar-withdraw" />
          </div>
          <div>
            <h6>Revenue Chart</h6>
            <BarChart rows={reportData.monthly} valueKey="revenue" colorClass="bar-revenue" />
          </div>
          <div>
            <h6>Commission Chart</h6>
            <BarChart rows={reportData.monthly} valueKey="commission" colorClass="bar-commission" />
          </div>
        </div>
      </article>

      <div className="role-content-grid">
        <article className="role-panel">
          <h5>Fraud Detection Report</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Suspicious Transactions</th><td>{reportData.totals.suspiciousTransactions}</td></tr>
              <tr><th>Large Withdrawals (&ge; ₹50,000)</th><td>{reportData.totals.largeWithdrawals}</td></tr>
              <tr><th>Multiple Failed Transactions Users</th><td>{reportData.totals.multiFailedUsers}</td></tr>
              <tr><th>Account Lock Alerts</th><td>{reportData.totals.accountLockAlerts}</td></tr>
            </tbody>
          </table>
        </article>

        <article className="role-panel">
          <h5>Business Intelligence</h5>
          <table className="role-table">
            <tbody>
              <tr><th>Profit Prediction (Next Month)</th><td>{formatCurrency(reportData.predictedProfit)}</td></tr>
              <tr><th>Revenue Growth Rate</th><td>{reportData.revenueGrowthRate.toFixed(2)}%</td></tr>
            </tbody>
          </table>
          <h6 className="mt-3">Agent Performance Ranking</h6>
          <table className="role-table">
            <thead><tr><th>Agent</th><th>Score</th></tr></thead>
            <tbody>
              {reportData.agentPerformanceRanking.map((row) => (
                <tr key={row.name}><td>{row.name}</td><td>{row.score.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <article className="role-panel">
        <h5>Top Users Report</h5>
        <table className="role-table" id="report-main-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Deposits</th>
              <th>Withdrawals</th>
              <th>Balance</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {reportData.userRows
              .sort((a, b) => b.deposits + b.withdrawals - (a.deposits + a.withdrawals))
              .slice(0, 12)
              .map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{formatCurrency(row.deposits)}</td>
                  <td>{formatCurrency(row.withdrawals)}</td>
                  <td>{formatCurrency(row.balance)}</td>
                  <td>{row.activity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </article>
    </section>
  );
};

export default AdminReportsSection;
