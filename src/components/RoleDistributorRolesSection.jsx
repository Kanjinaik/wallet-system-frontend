import React from "react";

const RoleDistributorRolesSection = ({ ctx }) => {
  const { role, activeSection, userManagementTab, distributorData, distributorWithdrawRequests, user } = ctx;

  if (role !== "distributor" || activeSection !== "user-management" || userManagementTab !== "roles") {
    return null;
  }

  return (
    <>
      <section className="role-stat-grid">
        <div className="role-stat-card green"><span>Total Retailers</span><strong>{distributorData?.total_retailers || 0}</strong></div>
        <div className="role-stat-card blue"><span>Active Retailers</span><strong>{(distributorData?.retailers || []).filter((item) => item.is_active).length}</strong></div>
        <div className="role-stat-card pink"><span>Inactive Retailers</span><strong>{(distributorData?.retailers || []).filter((item) => !item.is_active).length}</strong></div>
        <div className="role-stat-card indigo"><span>Pending Withdraw</span><strong>{(distributorWithdrawRequests || []).filter((item) => item.status === "pending").length}</strong></div>
      </section>
      <section className="role-panel">
        <h4>Roles</h4>
        <table className="role-table">
          <thead><tr><th>Role</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead>
          <tbody>
            <tr>
              <td>Distributor</td>
              <td>1</td>
              <td>{user?.is_active === false ? 0 : 1}</td>
              <td>{user?.is_active === false ? 1 : 0}</td>
            </tr>
            <tr>
              <td>Retailer</td>
              <td>{distributorData?.total_retailers || 0}</td>
              <td>{(distributorData?.retailers || []).filter((item) => item.is_active).length}</td>
              <td>{(distributorData?.retailers || []).filter((item) => !item.is_active).length}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
};

export default RoleDistributorRolesSection;
