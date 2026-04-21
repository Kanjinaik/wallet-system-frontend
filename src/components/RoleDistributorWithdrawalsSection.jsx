import React from "react";

const RoleDistributorWithdrawalsSection = ({ ctx }) => {
  const {
    role,
    activeSection,
    distributorWithdrawRequests,
    formatCurrency,
    withdrawRemarksDraft,
    setWithdrawRemarksDraft,
    handleWithdrawRequestDecision,
  } = ctx;

  if (role !== "distributor" || activeSection !== "withdrawals") {
    return null;
  }

  return (
    <section className="role-panel">
      <h4>Retailer Withdraw Requests</h4>
      <table className="role-table">
        <thead><tr><th>Date</th><th>Retailer</th><th>Amount</th><th>Net</th><th>Status</th><th>Remarks</th><th>Action</th></tr></thead>
        <tbody>
          {distributorWithdrawRequests.map((wr) => (
            <tr key={wr.id}>
              <td>{new Date(wr.created_at).toLocaleString()}</td>
              <td>{wr.user?.name || "-"}</td>
              <td>{formatCurrency(wr.amount)}</td>
              <td>{formatCurrency(wr.net_amount)}</td>
              <td className="text-capitalize">{wr.status}</td>
              <td>
                <input
                  placeholder="Remarks"
                  value={withdrawRemarksDraft[wr.id] ?? wr.remarks ?? ""}
                  onChange={(e) => setWithdrawRemarksDraft((p) => ({ ...p, [wr.id]: e.target.value }))}
                  disabled={!["pending", "approved"].includes(wr.status)}
                />
              </td>
              <td>
                {["pending", "approved"].includes(wr.status) ? (
                  <div className="role-actions">
                    <button type="button" onClick={() => handleWithdrawRequestDecision(wr.id, "approve")}>Approve</button>
                    <button type="button" className="secondary" onClick={() => handleWithdrawRequestDecision(wr.id, "reject")}>Reject</button>
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default RoleDistributorWithdrawalsSection;
