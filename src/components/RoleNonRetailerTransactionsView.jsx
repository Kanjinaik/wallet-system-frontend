import React from "react";

const RoleNonRetailerTransactionsView = ({ ctx }) => {
  const {
    role,
    isTransactionFilterOpen,
    hasActiveTransactionHistoryFilter,
    setIsTransactionFilterOpen,
    transactionHistoryFilter,
    setTransactionHistoryFilter,
    filteredNonRetailerTransactions,
    formatCurrency,
  } = ctx;

  return (
    <>
      <div className="role-section-toolbar">
        <h4>All Transactions</h4>
        <button
          type="button"
          className={`role-filter-toggle ${isTransactionFilterOpen || hasActiveTransactionHistoryFilter ? "active" : ""}`}
          onClick={() => setIsTransactionFilterOpen((prev) => !prev)}
        >
          <i className="bi bi-funnel-fill" />
          {isTransactionFilterOpen || hasActiveTransactionHistoryFilter ? "Hide Filter" : "Filter"}
        </button>
      </div>

      {(isTransactionFilterOpen || hasActiveTransactionHistoryFilter) && (
        <div className="role-filter-grid">
          <input
            type="text"
            placeholder="Filter by name"
            value={transactionHistoryFilter.name}
            onChange={(e) => setTransactionHistoryFilter((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="date"
            value={transactionHistoryFilter.date}
            onChange={(e) => setTransactionHistoryFilter((prev) => ({ ...prev, date: e.target.value }))}
          />
          <select
            value={transactionHistoryFilter.history_type}
            onChange={(e) => setTransactionHistoryFilter((prev) => ({ ...prev, history_type: e.target.value }))}
          >
            <option value="all">Previous Transaction History</option>
            {(role === "master_distributor" || role === "super_distributor" || role === "distributor") ? (
              <>
                <option value="commission">Commission History</option>
                <option value="commission_withdraw">Commission Withdrawal History</option>
              </>
            ) : (
              <>
                <option value="commission">Commission History</option>
                <option value="commission_withdraw">Commission Withdrawal History</option>
                <option value="deposit">Deposit History</option>
                <option value="withdraw">Withdrawal Transaction History</option>
              </>
            )}
          </select>
          <button
            type="button"
            className="secondary"
            onClick={() => setTransactionHistoryFilter({ name: "", date: "", history_type: "all" })}
          >
            Clear Filter
          </button>
        </div>
      )}

      {role === "master_distributor" ? (
        <table className="role-table">
          <thead><tr><th>Date</th><th>Commission Amount</th><th>Created By Super Distributor</th><th>Created By Distributor</th><th>Deposit Amount</th><th>From Retailer</th></tr></thead>
          <tbody>
            {filteredNonRetailerTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{formatCurrency(tx.commission_amount ?? tx.amount ?? 0)}</td>
                <td>{tx.created_by_super || "-"}</td>
                <td>{tx.created_by_distributor || "-"}</td>
                <td>{formatCurrency(tx.deposit_amount ?? tx.original_amount ?? tx.amount ?? 0)}</td>
                <td>{tx.retailer_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : role === "super_distributor" ? (
        <table className="role-table">
          <thead><tr><th>Date</th><th>Commission Amount</th><th>Created By Distributor</th><th>Deposit Amount</th><th>From Retailer</th></tr></thead>
          <tbody>
            {filteredNonRetailerTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{formatCurrency(tx.commission_amount ?? tx.amount ?? 0)}</td>
                <td>{tx.created_by_distributor || "-"}</td>
                <td>{formatCurrency(tx.deposit_amount ?? tx.original_amount ?? tx.amount ?? 0)}</td>
                <td>{tx.retailer_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="role-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th><th>Details</th></tr></thead>
          <tbody>
            {filteredNonRetailerTransactions.map((tx) => (
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

export default RoleNonRetailerTransactionsView;
