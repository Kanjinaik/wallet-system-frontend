import React, { useMemo } from "react";
import { formatCurrency } from "./constants";
import { downloadCsv } from "./roleDashboardHelpers";

const toNumber = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const isExpenseTx = (tx) => {
  const type = String(tx.type || "").toLowerCase();
  const desc = String(tx.description || "").toLowerCase();
  const amount = toNumber(tx.amount);
  if (amount < 0) return true;
  if (type.includes("withdraw") || type.includes("payout") || type.includes("transfer")) return true;
  if (type.includes("payment") || type.includes("debit")) return true;
  if (desc.includes("withdraw") || desc.includes("payout")) return true;
  return false;
};

const buildDailySeries = (transactions, days = 7) => {
  const today = new Date();
  const base = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const cursor = new Date(today);
    cursor.setDate(today.getDate() - i);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    base.push({
      key,
      label: cursor.toLocaleDateString("en-IN", { weekday: "short" }),
      income: 0,
      expense: 0,
    });
  }
  const map = new Map(base.map((item) => [item.key, item]));
  transactions.forEach((tx) => {
    const d = new Date(tx.created_at || tx.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const point = map.get(key);
    if (!point) return;
    const amount = Math.abs(toNumber(tx.amount));
    if (isExpenseTx(tx)) {
      point.expense += amount;
    } else {
      point.income += amount;
    }
  });
  return base;
};

const computeChange = (transactions, days = 7) => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startCurrent = new Date(end);
  startCurrent.setDate(end.getDate() - (days - 1));
  const startPrev = new Date(startCurrent);
  startPrev.setDate(startPrev.getDate() - days);

  let current = 0;
  let previous = 0;

  transactions.forEach((tx) => {
    const d = new Date(tx.created_at || tx.date);
    if (Number.isNaN(d.getTime())) return;
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const net = isExpenseTx(tx) ? -Math.abs(toNumber(tx.amount)) : Math.abs(toNumber(tx.amount));
    if (day >= startCurrent && day <= end) {
      current += net;
    } else if (day >= startPrev && day < startCurrent) {
      previous += net;
    }
  });

  const pct = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : current > 0 ? 100 : 0;
  return { current, previous, pct: Number(pct.toFixed(1)) };
};

const maskSensitive = (value) => {
  if (!value) return "--";
  const str = String(value);
  if (str.length <= 4) return str;
  const visible = str.slice(-4);
  return `${"*".repeat(Math.max(0, str.length - 4))}${visible}`;
};

const statusTone = (status) => {
  const s = String(status || "completed").toLowerCase();
  if (["success", "completed", "approved", "processed"].includes(s)) return "success";
  if (["pending", "processing", "initiated"].includes(s)) return "pending";
  return "failed";
};

const formatStatementDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-").toUpperCase();
};

const formatStatementAmount = (value) => Number(value || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const RetailerDashboardSection = ({
  activeSection,
  retailerDashboard,
  mainWallet,
  recentTransactions = [],
  transactions = [],
  notifications = [],
  payinStats,
  payoutStats,
  profile,
  onQuickAction,
  onViewTransactions,
  onViewWallet,
}) => {
  const walletBalance = toNumber(retailerDashboard?.wallet_balance ?? mainWallet?.balance);
  const walletId = mainWallet?.id || retailerDashboard?.wallet_id || "--";
  const minWithdraw = toNumber(retailerDashboard?.min_withdraw_amount || 100);
  const pendingWithdraw = retailerDashboard?.withdraw_requests_pending || 0;
  const walletNumber =
    retailerDashboard?.account_number ||
    profile?.bank_account_number ||
    mainWallet?.account_number ||
    profile?.phone ||
    "--";
  const bankName = profile?.bank_name || retailerDashboard?.bank_name || "Add bank in Profile";
  const ifsc = profile?.bank_ifsc_code || retailerDashboard?.bank_ifsc_code || "--";

  const dailySeries = useMemo(() => buildDailySeries(transactions, 7), [transactions]);
  const incomeExpenseTotals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amt = Math.abs(toNumber(tx.amount));
        if (isExpenseTx(tx)) {
          acc.expense += amt;
        } else {
          acc.income += amt;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const weeklyChange = useMemo(() => computeChange(transactions, 7), [transactions]);
  const monthlyChange = useMemo(() => computeChange(transactions, 30), [transactions]);

  const statementData = useMemo(() => {
    const sorted = [...transactions]
      .filter((tx) => tx?.created_at || tx?.date)
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
      .slice(0, 500);

    const { rows, nextBalance } = sorted.reduce(
      (acc, tx) => {
        const amount = Math.abs(toNumber(tx.amount));
        const expense = isExpenseTx(tx);
        const rowBalance = acc.nextBalance;
        const signedAmount = expense ? -amount : amount;

        acc.rows.push({
          date: tx.created_at || tx.date,
          dateLabel: formatStatementDate(tx.created_at || tx.date),
          particulars: tx.description || tx.reference || tx.type || "Wallet transaction",
          chequeNo: tx.reference || tx.transaction_id || tx.id || "--",
          debit: expense ? amount : 0,
          credit: expense ? 0 : amount,
          balance: rowBalance,
          status: tx.status || "completed",
          type: tx.type || "",
        });
        acc.nextBalance = rowBalance - signedAmount;
        return acc;
      },
      { rows: [], nextBalance: walletBalance }
    );

    const dates = rows.map((row) => new Date(row.date)).filter((date) => !Number.isNaN(date.getTime()));
    const fromDate = dates.length ? new Date(Math.min(...dates)) : new Date();
    const toDate = dates.length ? new Date(Math.max(...dates)) : new Date();

    return {
      rows,
      broughtForward: nextBalance,
      closingBalance: walletBalance,
      fromDate: formatStatementDate(fromDate),
      toDate: formatStatementDate(toDate),
    };
  }, [transactions, walletBalance]);

  const maxSeriesValue = Math.max(
    ...dailySeries.map((item) => Math.max(item.income, item.expense)),
    1
  );
  const toPoints = (key) =>
    dailySeries
      .map((item, index) => {
        const x = (index / Math.max(1, dailySeries.length - 1)) * 100;
        const y = 40 - (item[key] / maxSeriesValue) * 32;
        return `${x},${y}`;
      })
      .join(" ");

  const exportStatement = () => {
    const rows = [
      ["Account No", walletNumber],
      ["Statement Dt", `${statementData.fromDate} to ${statementData.toDate}`],
      ["Amt Brought Forward", formatStatementAmount(statementData.broughtForward)],
      ["Closing Balance", formatStatementAmount(statementData.closingBalance)],
      [],
      ["Date", "Particulars", "Chq No", "Debit", "Credit", "Balance"],
      ...statementData.rows.map((row) => [
        row.dateLabel,
        row.particulars,
        row.chequeNo,
        row.debit ? formatStatementAmount(row.debit) : "",
        row.credit ? formatStatementAmount(row.credit) : "",
        formatStatementAmount(row.balance),
      ]),
    ];
    downloadCsv(rows, `retailer_bank_statement_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportTransactions = () => {
    const rows = [["Date", "Type", "Amount", "Status", "Reference"]];
    transactions.slice(0, 500).forEach((tx) => {
      rows.push([
        tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN") : "",
        tx.type || "",
        toNumber(tx.amount),
        tx.status || "",
        tx.description || tx.reference || "",
      ]);
    });
    downloadCsv(rows, `wallet_report_${new Date().toISOString().slice(0, 10)}`);
  };

  const printStatement = () => {
    const statementWindow = window.open("", "_blank", "width=1100,height=800");
    if (!statementWindow) {
      window.print();
      return;
    }

    const statementRowsHtml = statementData.rows.length
      ? statementData.rows.map((row) => `
          <tr>
            <td>${row.dateLabel}</td>
            <td>${String(row.particulars || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            <td>${String(row.chequeNo || "--").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
            <td class="num">${row.debit ? formatStatementAmount(row.debit) : ""}</td>
            <td class="num">${row.credit ? formatStatementAmount(row.credit) : ""}</td>
            <td class="num">${formatStatementAmount(row.balance)}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" class="empty">No statement rows available.</td></tr>`;

    statementWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Retailer Statement</title>
          <style>
            body{font-family:Arial,sans-serif;margin:22px;color:#111}
            .sheet{border:1px solid #cfcfcf;padding:18px}
            .head{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px;font-size:14px}
            .line{display:flex;gap:10px;align-items:center;margin-bottom:6px}
            .label{min-width:130px;font-weight:700}
            .value{font-weight:700}
            .value.num{text-align:right}
            table{width:100%;border-collapse:collapse;font-size:13px}
            th,td{border:1px solid #4b4b4b;padding:8px 6px;vertical-align:top}
            th{background:#f5f5f5;text-align:center;font-size:12px}
            td.num{text-align:right;white-space:nowrap}
            td:nth-child(2){width:48%}
            .empty{text-align:center;padding:18px}
            @media print{body{margin:0}.sheet{border:none;padding:0}}
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="head">
              <div>
                <div class="line"><span class="label">Account No</span><span>:</span><span class="value">${walletNumber || "--"}</span></div>
              </div>
              <div>
                <div class="line"><span class="label">Statement Dt</span><span>:</span><span class="value">${statementData.fromDate} to ${statementData.toDate}</span></div>
                <div class="line"><span class="label">Amt Brought Forward</span><span>:</span><span class="value num">${formatStatementAmount(statementData.broughtForward)}</span></div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Chq No</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>${statementRowsHtml}</tbody>
            </table>
          </div>
        </body>
      </html>`);
    statementWindow.document.close();
    statementWindow.focus();
    statementWindow.print();
  };

  const renderSupport = () => (
    <section className="retailer-shell">
      <div className="retailer-grid">
        <article className="retailer-card support">
          <header className="retailer-card-head">
            <div>
              <p className="eyebrow">Retailer Support</p>
              <h3>We are here to help</h3>
              <p className="muted">Manage tickets, payouts, commissions, and compliance from a single view.</p>
            </div>
            <button type="button" className="retailer-chip primary" onClick={onViewWallet}>Go to Wallet</button>
          </header>
          <div className="retailer-support-grid">
            <div>
              <h5>Support Channels</h5>
              <ul className="retailer-list">
                <li><i className="bi bi-headset" /> 24x7 chat + phone escalation</li>
                <li><i className="bi bi-envelope-open" /> support@wallet.com</li>
                <li><i className="bi bi-life-preserver" /> Priority SLA for payouts & refunds</li>
              </ul>
            </div>
            <div>
              <h5>Open Items</h5>
              <ul className="retailer-list compact">
                <li><span className="retailer-dot success" /> Pending withdrawals: {pendingWithdraw}</li>
                <li><span className="retailer-dot info" /> Notifications: {notifications.length}</li>
                <li><span className="retailer-dot warning" /> KYC min withdraw: {formatCurrency(minWithdraw)}</li>
              </ul>
            </div>
          </div>
          <div className="retailer-support-actions">
            <button type="button" className="retailer-btn ghost" onClick={() => window.open("https://wa.me/","_blank")}>Chat on WhatsApp</button>
            <button type="button" className="retailer-btn solid" onClick={exportTransactions}>Download Support Snapshot</button>
          </div>
        </article>
        <article className="retailer-card">
          <header className="retailer-card-head">
            <div>
              <p className="eyebrow">Recent Alerts</p>
              <h4>Notifications</h4>
            </div>
          </header>
          <ul className="retailer-alerts">
            {(notifications || []).slice(0, 6).map((note) => (
              <li key={note.id || note.title} className="retailer-alert">
                <div>
                  <strong>{note.title || "Notification"}</strong>
                  <p className="muted">{note.message || note.body || "Update available"}</p>
                </div>
                <span className="retailer-chip subtle">{note.created_at ? new Date(note.created_at).toLocaleDateString("en-IN") : "Today"}</span>
              </li>
            ))}
            {(!notifications || notifications.length === 0) && <li className="muted">No notifications available.</li>}
          </ul>
        </article>
      </div>
    </section>
  );

  const renderReports = () => (
    <section className="retailer-shell">
      <div className="retailer-grid reports">
        <article className="retailer-card">
          <header className="retailer-card-head">
            <div>
              <p className="eyebrow">Reports</p>
              <h3>Bank Statement</h3>
              <p className="muted">Retailer report export and print in statement format.</p>
            </div>
            <div className="retailer-chip primary">Last 500 rows</div>
          </header>
          <div className="retailer-statement-head">
            <div className="retailer-statement-line"><span>Account No</span><strong>{walletNumber || "--"}</strong></div>
            <div className="retailer-statement-line"><span>Statement Dt</span><strong>{statementData.fromDate} to {statementData.toDate}</strong></div>
            <div className="retailer-statement-line"><span>Amt Brought Forward</span><strong>{formatCurrency(statementData.broughtForward)}</strong></div>
          </div>
          <div className="retailer-analytics-grid retailer-statement-summary">
            <div className="retailer-analytic-card income">
              <span>Total Credit</span>
              <strong>{formatCurrency(incomeExpenseTotals.income)}</strong>
              <small>{payinStats ? `${payinStats.successCount || 0} successful` : "Wallet inflows"}</small>
            </div>
            <div className="retailer-analytic-card expense">
              <span>Total Debit</span>
              <strong>{formatCurrency(incomeExpenseTotals.expense)}</strong>
              <small>{payoutStats ? `${payoutStats.processedCount || 0} processed` : "Wallet outflows"}</small>
            </div>
            <div className="retailer-analytic-card net">
              <span>Closing Balance</span>
              <strong>{formatCurrency(statementData.closingBalance)}</strong>
              <small>Based on visible statement rows</small>
            </div>
          </div>
          <div className="retailer-statement-table-wrap">
            <table className="retailer-statement-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Chq No</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {statementData.rows.map((row, index) => (
                  <tr key={`${row.chequeNo}-${index}`}>
                    <td>{row.dateLabel}</td>
                    <td>{row.particulars}</td>
                    <td>{row.chequeNo}</td>
                    <td className="num">{row.debit ? formatStatementAmount(row.debit) : ""}</td>
                    <td className="num">{row.credit ? formatStatementAmount(row.credit) : ""}</td>
                    <td className="num">{formatStatementAmount(row.balance)}</td>
                  </tr>
                ))}
                {statementData.rows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="retailer-statement-empty">No statement rows available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="retailer-report-actions">
            <button type="button" className="retailer-btn ghost" onClick={printStatement}><i className="bi bi-file-earmark-pdf" /> Print / PDF</button>
            <button type="button" className="retailer-btn ghost" onClick={exportStatement}><i className="bi bi-download" /> Export CSV</button>
            <button type="button" className="retailer-btn solid" onClick={onViewTransactions}><i className="bi bi-eye" /> Go to Transactions</button>
          </div>
        </article>
      </div>
    </section>
  );

  if (activeSection === "support") {
    return renderSupport();
  }

  if (activeSection === "reports") {
    return renderReports();
  }

  if (activeSection !== "dashboard") {
    return null;
  }

  return (
    <section className="retailer-shell">
      <div className="retailer-grid">
        <div className="retailer-main">
          <article className="retailer-hero">
            <div className="retailer-hero-left">
              <p className="eyebrow">Wallet Balance</p>
              <h1>{formatCurrency(walletBalance)}</h1>
              <div className="retailer-hero-meta">
                <span className={`retailer-chip ${weeklyChange.pct >= 0 ? "success" : "danger"}`}>
                  {weeklyChange.pct >= 0 ? "+" : ""}
                  {weeklyChange.pct}% vs last week
                </span>
                <span className="retailer-chip neutral">Monthly: {monthlyChange.pct >= 0 ? "+" : ""}{monthlyChange.pct}%</span>
              </div>
              <div className="retailer-hero-id">
                <div>
                  <small>Wallet ID</small>
                  <strong>{walletId}</strong>
                </div>
                <div>
                  <small>Wallet No</small>
                  <strong>{maskSensitive(walletNumber)}</strong>
                </div>
                <div>
                  <small>Bank</small>
                  <strong>{bankName}</strong>
                </div>
              </div>
            </div>
            <div className="retailer-hero-actions">
              <button type="button" className="retailer-btn solid" onClick={() => onQuickAction?.("add")}><i className="bi bi-plus-circle" /> Add Money</button>
              <button type="button" className="retailer-btn outline" onClick={() => onQuickAction?.("withdraw")}><i className="bi bi-wallet2" /> Withdraw</button>
            </div>
          </article>

          <div className="retailer-quick-actions">
            {[
              { key: "add", label: "Add Money", icon: "bi-plus-circle" },
              { key: "qr", label: "Scan QR", icon: "bi-qr-code-scan" },
              { key: "withdraw", label: "Withdraw", icon: "bi-cash-coin" },
            ].map((item) => (
              <button key={item.key} type="button" className="retailer-quick-card" onClick={() => onQuickAction?.(item.key)}>
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="retailer-split">
            <article className="retailer-card">
              <header className="retailer-card-head">
                <div>
                  <p className="eyebrow">Recent</p>
                  <h4>Transactions</h4>
                </div>
                <button type="button" className="retailer-link" onClick={onViewTransactions}>View All</button>
              </header>
              <ul className="retailer-tx-list">
                {recentTransactions.map((tx) => (
                  <li key={tx.id || tx.reference}>
                    <div className="retailer-tx-meta">
                      <strong>{tx.description || tx.reference || tx.type || "Transaction"}</strong>
                      <small>{tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "--"}</small>
                    </div>
                    <div className="retailer-tx-amount">
                      <span>{isExpenseTx(tx) ? "-" : "+"}{formatCurrency(Math.abs(toNumber(tx.amount)))}</span>
                      <span className={`retailer-chip ${statusTone(tx.status)}`}>{tx.status || "success"}</span>
                    </div>
                  </li>
                ))}
                {recentTransactions.length === 0 && <li className="muted">No transactions yet.</li>}
              </ul>
            </article>
            <article className="retailer-card">
              <header className="retailer-card-head">
                <div>
                  <p className="eyebrow">Wallet</p>
                  <h4>Limits & Linked Bank</h4>
                </div>
                <button type="button" className="retailer-link" onClick={onViewWallet}>Manage</button>
              </header>
              <div className="retailer-meta-grid">
                <div className="retailer-meta-item">
                  <span>Linked Bank</span>
                  <strong>{bankName}</strong>
                  <small>{maskSensitive(walletNumber)} | {ifsc}</small>
                </div>
                <div className="retailer-meta-item">
                  <span>Min Withdraw</span>
                  <strong>{formatCurrency(minWithdraw)}</strong>
                  <small>Pending: {pendingWithdraw}</small>
                </div>
                <div className="retailer-meta-item">
                  <span>Wallet Activity</span>
                  <strong>{transactions.length} tx</strong>
                  <small>Today: {recentTransactions.filter((tx) => {
                    const d = new Date(tx.created_at || tx.date);
                    const today = new Date();
                    return d.toDateString() === today.toDateString();
                  }).length}</small>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="retailer-side">
          <article className="retailer-card chart-card">
            <header className="retailer-card-head">
              <div>
                <p className="eyebrow">Overview</p>
                <h4>Income vs Expense</h4>
              </div>
            </header>
            <div className="retailer-chart">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline points={toPoints("income")} className="retailer-line income" />
                <polyline points={toPoints("expense")} className="retailer-line expense" />
              </svg>
              <div className="retailer-chart-legend">
                {dailySeries.map((item) => (
                  <div key={item.key} className="retailer-chart-item">
                    <span>{item.label}</span>
                    <div className="retailer-chart-values">
                      <span className="income">+{formatCurrency(item.income)}</span>
                      <span className="expense">-{formatCurrency(item.expense)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="retailer-analytics-grid">
            <div className="retailer-analytic-card income">
              <span>Income</span>
              <strong>{formatCurrency(incomeExpenseTotals.income)}</strong>
              <small>{payinStats ? `${payinStats.successCount || 0} successes` : "All inflows"}</small>
            </div>
            <div className="retailer-analytic-card expense">
              <span>Expenses</span>
              <strong>{formatCurrency(incomeExpenseTotals.expense)}</strong>
              <small>{payoutStats ? `${payoutStats.processedCount || 0} processed` : "All outflows"}</small>
            </div>
          </div>

          <article className="retailer-card methods">
            <header className="retailer-card-head">
              <div>
                <p className="eyebrow">Add Money</p>
                <h4>Supported Methods</h4>
              </div>
              <button type="button" className="retailer-chip primary" onClick={() => onQuickAction?.("add")}>Add now</button>
            </header>
            <div className="retailer-method-grid">
              {["Credit Card"].map((item) => (
                <div key={item} className="retailer-method">
                  <i className="bi bi-check-circle" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="retailer-card alerts">
            <header className="retailer-card-head">
              <div>
                <p className="eyebrow">Notifications</p>
                <h4>Latest Alerts</h4>
              </div>
            </header>
            <ul className="retailer-alerts">
              {(notifications || []).slice(0, 4).map((note) => (
                <li key={note.id || note.title} className="retailer-alert">
                  <div>
                    <strong>{note.title || "Notification"}</strong>
                    <p className="muted">{note.message || note.body || "Update available"}</p>
                  </div>
                  <span className="retailer-chip subtle">{note.created_at ? new Date(note.created_at).toLocaleDateString("en-IN") : "Today"}</span>
                </li>
              ))}
              {(!notifications || notifications.length === 0) && <li className="muted">You are all caught up.</li>}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
};

export default RetailerDashboardSection;
