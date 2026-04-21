import React from "react";

const payoutStatusClass = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (["paid", "success", "completed", "approved", "processed"].includes(normalized)) return "success";
  if (["pending", "processing", "initiated"].includes(normalized)) return "pending";
  return "failed";
};

const RoleRetailerTransactionsView = ({ ctx }) => {
  const {
    retailerTransactionTab,
    isTransactionFilterOpen,
    hasActiveRetailerFilters,
    setIsTransactionFilterOpen,
    retailerHistoryFilter,
    setRetailerHistoryFilter,
    setRetailerTransactionTab,
    setTransactionFilters,
    handleRetailerExport,
    handleRetailerPayoutExport,
    handleRetailerHistoryRefresh,
    formatCurrency,
    payinStats,
    payoutStats,
    loadTransactionsWithFilters,
    transactionFilters,
    retailerPayinSearch,
    setRetailerPayinSearch,
    retailerPayinStatusFilter,
    setRetailerPayinStatusFilter,
    loadRetailerData,
    retailerPayoutSearch,
    setRetailerPayoutSearch,
    retailerPayoutStatusFilter,
    setRetailerPayoutStatusFilter,
    filteredRetailerPayins,
    filteredRetailerPayouts,
  } = ctx;

  return (
    <>
      <div className="role-actions role-retailer-history-actions">
        <button
          type="button"
          className={`${isTransactionFilterOpen || hasActiveRetailerFilters ? "secondary" : ""}`}
          onClick={() => setIsTransactionFilterOpen((prev) => !prev)}
        >
          <i className="bi bi-funnel-fill" /> {isTransactionFilterOpen || hasActiveRetailerFilters ? "Hide Filter" : "Filter"}
        </button>
        <select
          value={retailerHistoryFilter}
          onChange={(e) => {
            const nextValue = e.target.value;
            setRetailerHistoryFilter(nextValue);
            if (nextValue === "deposit") {
              setRetailerTransactionTab("payin");
              setTransactionFilters((p) => ({ ...p, type: "deposit" }));
            } else if (nextValue === "withdraw") {
              setRetailerTransactionTab("payouts");
              setTransactionFilters((p) => ({ ...p, type: "withdraw" }));
            } else {
              setTransactionFilters((p) => ({ ...p, type: "" }));
            }
          }}
          aria-label="Filter transaction history"
        >
          <option value="all">Transaction History</option>
          <option value="deposit">Deposit History</option>
          <option value="withdraw">Withdrawal History</option>
        </select>
        <button type="button" onClick={retailerTransactionTab === "payin" ? handleRetailerExport : handleRetailerPayoutExport}>
          Export CSV
        </button>
        <button type="button" className="secondary" onClick={handleRetailerHistoryRefresh}>Refresh</button>
      </div>

      {retailerTransactionTab === "payin" ? (
        <div className="role-commission-grid role-retailer-history-stats">
          <div className="role-chip">Total Payin Volume: <strong>{formatCurrency(payinStats.totalVolume)}</strong></div>
          <div className="role-chip">Successful Transactions: <strong>{payinStats.successCount}</strong></div>
          <div className="role-chip">Pending Transactions: <strong>{payinStats.pendingCount}</strong></div>
          <div className="role-chip">Failed Transactions: <strong>{payinStats.failedCount}</strong></div>
        </div>
      ) : (
        <div className="role-commission-grid role-retailer-history-stats">
          <div className="role-chip">Total Payout Volume: <strong>{formatCurrency(payoutStats.totalVolume)}</strong></div>
          <div className="role-chip">Processed Payouts: <strong>{payoutStats.processedCount}</strong></div>
          <div className="role-chip">Pending Payouts: <strong>{payoutStats.pendingCount}</strong></div>
          <div className="role-chip">Failed Payouts: <strong>{payoutStats.failedCount}</strong></div>
        </div>
      )}

      {(isTransactionFilterOpen || hasActiveRetailerFilters) && (
        retailerTransactionTab === "payin" ? (
          <form className="role-filter-grid" onSubmit={(e) => { e.preventDefault(); loadTransactionsWithFilters(); }}>
            <select value={transactionFilters.type} onChange={(e) => setTransactionFilters((p) => ({ ...p, type: e.target.value }))}>
              <option value="">All types</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="transfer">Transfer</option>
              <option value="receive">Receive</option>
              
            </select>
            <input type="date" value={transactionFilters.start_date} onChange={(e) => setTransactionFilters((p) => ({ ...p, start_date: e.target.value }))} />
            <input type="date" value={transactionFilters.end_date} onChange={(e) => setTransactionFilters((p) => ({ ...p, end_date: e.target.value }))} />
            <input
              type="text"
              placeholder="Search by id, type, amount, details"
              value={retailerPayinSearch}
              onChange={(e) => setRetailerPayinSearch(e.target.value)}
            />
            <select value={retailerPayinStatusFilter} onChange={(e) => setRetailerPayinStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="approved">Approved</option>
            </select>
            <button type="submit">Apply Filter</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setTransactionFilters({ type: "", start_date: "", end_date: "" });
                setRetailerPayinSearch("");
                setRetailerPayinStatusFilter("all");
                loadRetailerData();
              }}
            >
              Clear All
            </button>
          </form>
        ) : (
          <div className="role-filter-grid">
            <input
              type="text"
              placeholder="Search by transaction id, remarks, amount"
              value={retailerPayoutSearch}
              onChange={(e) => setRetailerPayoutSearch(e.target.value)}
            />
            <select value={retailerPayoutStatusFilter} onChange={(e) => setRetailerPayoutStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="approved">Processed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setRetailerPayoutSearch("");
                setRetailerPayoutStatusFilter("all");
              }}
            >
              Clear All
            </button>
          </div>
        )
      )}

      <p className="muted role-retailer-history-meta">
        {retailerTransactionTab === "payin"
          ? `Showing ${filteredRetailerPayins.length} payin records`
          : `Showing ${filteredRetailerPayouts.length} payout records | Net Volume: ${formatCurrency(payoutStats.netVolume)}`}
      </p>

      {retailerTransactionTab === "payouts" ? (
        <table className="role-table">
          <thead><tr><th>Transaction ID</th><th>Date</th><th>Amount</th><th>Net</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>
            {filteredRetailerPayouts.map((wr) => (
              <tr key={wr.id}>
                <td>{wr.reference || wr.transaction_id || `PAYOUT-${wr.id}`}</td>
                <td>{new Date(wr.created_at).toLocaleString()}</td>
                <td>{formatCurrency(wr.amount)}</td>
                <td>{formatCurrency(wr.net_amount)}</td>
                <td>
                  <span className={`payout-status-pill ${payoutStatusClass(wr.status)}`}>
                    {String(wr.status || "pending")}
                  </span>
                </td>
                <td>{wr.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="role-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th><th>Details</th></tr></thead>
          <tbody>
            {filteredRetailerPayins.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td className="text-capitalize">{tx.type}</td>
                <td>{formatCurrency(tx.amount)}</td>
                <td className="text-capitalize">{tx.status || "completed"}</td>
                <td>{tx.reference || `TXN-${tx.id}`}</td>
                <td>{tx.description || tx.reference || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default RoleRetailerTransactionsView;
