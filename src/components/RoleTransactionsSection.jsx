import React from "react";
import RoleRetailerTransactionsView from "./RoleRetailerTransactionsView";
import RoleNonRetailerTransactionsView from "./RoleNonRetailerTransactionsView";

const RoleTransactionsSection = ({ ctx }) => {
  const {
    activeSection,
    role,
    retailerTransactionTab,
  } = ctx;

  if (activeSection !== "transactions") {
    return null;
  }

  return (
    <section className={`role-panel ${role === "retailer" ? "role-retailer-history" : ""}`}>
      {role === "retailer" ? (
        <>
          <div className="role-section-toolbar">
            <h4>{retailerTransactionTab === "payin" ? "Payin History" : "Payouts History"}</h4>
          </div>
          <RoleRetailerTransactionsView ctx={ctx} />
        </>
      ) : (
        <RoleNonRetailerTransactionsView ctx={ctx} />
      )}
    </section>
  );
};

export default RoleTransactionsSection;
