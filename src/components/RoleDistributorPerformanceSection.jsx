import React from "react";

const RoleDistributorPerformanceSection = ({ ctx }) => {
  const { role, activeSection, distributorPerformance, formatCurrency } = ctx;

  if (role !== "distributor" || activeSection !== "performance") {
    return null;
  }

  return (
    <>
      <section className="role-stat-grid">
        <div className="role-stat-card teal"><span>Weekly Withdraw</span><strong>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.weekly)}</strong></div>
        <div className="role-stat-card gold"><span>Monthly Withdraw</span><strong>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.monthly)}</strong></div>
        <div className="role-stat-card pink"><span>Bonus Commission</span><strong>{formatCurrency(distributorPerformance?.bonus?.bonus_commission)}</strong></div>
        <div className="role-stat-card green"><span>Total Incentives</span><strong>{formatCurrency(distributorPerformance?.bonus?.total_bonus)}</strong></div>
      </section>
      <section className="role-content-grid">
        <article className="role-panel">
          <h4>Weekly Graph</h4>
          <table className="role-table">
            <thead><tr><th>Day</th><th>Withdraw Amount</th></tr></thead>
            <tbody>
              {(distributorPerformance?.weekly_chart || []).map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{formatCurrency(item.withdraw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="role-panel">
          <h4>Monthly Graph</h4>
          <table className="role-table">
            <thead><tr><th>Month</th><th>Withdraw</th><th>Commission</th></tr></thead>
            <tbody>
              {(distributorPerformance?.monthly_chart || []).map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{formatCurrency(item.withdraw)}</td>
                  <td>{formatCurrency(item.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
};

export default RoleDistributorPerformanceSection;
