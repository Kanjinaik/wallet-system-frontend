import React from "react";
import { formatCurrency } from "./constants";

const AdminDashboardSection = ({
  activeSection,
  adminStats,
  adminUsers,
  wallets,
  adminTransferForm,
  setAdminTransferForm,
  handleAdminTransfer,
  recentTransactions,
}) => {
  return (
    <>
      {activeSection === "dashboard" && (
        <>
          <section className="role-stat-grid">
            <div className="role-stat-card blue">
              <span>Total Wallet Balance</span>
              <strong>{formatCurrency(adminStats?.total_balance)}</strong>
            </div>
            <div className="role-stat-card gold">
              <span>Total Distributors</span>
              <strong>{adminStats?.total_distributors || 0}</strong>
            </div>
            <div className="role-stat-card teal">
              <span>Total Retailers</span>
              <strong>{adminStats?.total_retailers || 0}</strong>
            </div>
            <div className="role-stat-card pink">
              <span>Total Commission</span>
              <strong>{formatCurrency(adminStats?.total_commission)}</strong>
            </div>
          </section>

          <section className="role-content-grid">
            <article className="role-panel">
              <h4>Distributor List</h4>
              <table className="role-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Retailers</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers
                    .filter((u) => u.role === "distributor")
                    .map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          {
                            adminUsers.filter(
                              (r) =>
                                r.role === "retailer" &&
                                Number(r.distributor_id) === Number(u.id)
                            ).length
                          }
                        </td>
                        <td>{u.is_active ? "Active" : "Inactive"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </article>
          </section>

          <section className="role-panel">
            <h4>Transaction History</h4>
            <table className="role-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="text-capitalize">{tx.type}</td>
                    <td>{formatCurrency(tx.amount)}</td>
                    <td className="text-capitalize">{tx.status || "completed"}</td>
                    <td>{tx.description || tx.reference || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {activeSection === "wallet-transfer" && (
        <section className="role-panel">
          <h4>Transfer Wallet To Wallet</h4>
          <form className="role-form" onSubmit={handleAdminTransfer}>
            <select
              value={adminTransferForm.from_wallet_id}
              onChange={(e) =>
                setAdminTransferForm((p) => ({
                  ...p,
                  from_wallet_id: e.target.value,
                }))
              }
              required
            >
              <option value="">Select Source Wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - {wallet.user?.name || "Unknown User"} (
                  {formatCurrency(wallet.balance)})
                </option>
              ))}
            </select>

            <select
              value={adminTransferForm.to_wallet_id}
              onChange={(e) =>
                setAdminTransferForm((p) => ({
                  ...p,
                  to_wallet_id: e.target.value,
                }))
              }
              required
            >
              <option value="">Select Destination Wallet</option>
              {wallets
                .filter(
                  (wallet) =>
                    String(wallet.id) !== String(adminTransferForm.from_wallet_id)
                )
                .map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} - {wallet.user?.name || "Unknown User"} (
                    {formatCurrency(wallet.balance)})
                  </option>
                ))}
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={adminTransferForm.amount}
              onChange={(e) =>
                setAdminTransferForm((p) => ({
                  ...p,
                  amount: e.target.value,
                }))
              }
              required
            />
            <input
              placeholder="Description (optional)"
              value={adminTransferForm.description}
              onChange={(e) =>
                setAdminTransferForm((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
            <button type="submit">Transfer</button>
          </form>
        </section>
      )}
    </>
  );
};

export default AdminDashboardSection;