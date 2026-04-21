import React from "react";

const RoleRechargeQuickAmounts = ({
  amounts,
  selectedAmount,
  onSelect,
  formatCurrency,
  buttonKeyPrefix = "quick",
  activeClassName = "btn-primary border-0 shadow-sm",
  inactiveClassName = "btn-light border-secondary-subtle text-muted",
  className = "d-flex flex-wrap gap-2",
}) => (
  <div className={className}>
    {amounts.map((amount) => (
      <button
        key={`${buttonKeyPrefix}-${amount}`}
        type="button"
        className={`btn btn-sm rounded-pill fw-bold border ${
          String(selectedAmount) === String(amount) ? activeClassName : inactiveClassName
        }`}
        onClick={() => onSelect(String(amount))}
      >
        {formatCurrency ? formatCurrency(amount) : `Rs ${amount}`}
      </button>
    ))}
  </div>
);

export default RoleRechargeQuickAmounts;
