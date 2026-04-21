import { useMemo } from "react";

export const useRoleDashboardSelectors = ({
  wallets,
  transactions,
  transactionHistoryFilter,
  role,
  retailerPayinSearch,
  retailerPayinStatusFilter,
  retailerWithdrawRequests,
  retailerPayoutSearch,
  retailerPayoutStatusFilter,
  retailerHistoryFilter,
  transactionFilters,
  selectedRechargeService,
  rechargeOperatorSearch,
  rechargeOperator,
  userManagementTab,
  activeSection,
  DTH_OPERATORS,
  METRO_OPERATORS,
  BROADBAND_PROVIDERS,
  EDUCATION_INSTITUTES,
  INSURANCE_PROVIDERS,
  LOAN_PROVIDERS,
  RECHARGE_OPERATORS,
  RECHARGE_PLAN_SUGGESTIONS,
  RECHARGE_QUICK_AMOUNTS,
}) => {
  const totalWalletBalance = useMemo(
    () => wallets.reduce((sum, item) => sum + Number(item.balance || 0), 0),
    [wallets]
  );
  const mainWallet = useMemo(() => wallets.find((item) => item.type === "main") || wallets[0], [wallets]);
  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);
  const visibleTransactions = useMemo(() => transactions.slice(0, 25), [transactions]);

  const filteredNonRetailerTransactions = useMemo(() => {
    const nameTerm = transactionHistoryFilter.name.trim().toLowerCase();
    const selectedDate = transactionHistoryFilter.date;
    const selectedHistoryType = transactionHistoryFilter.history_type;
    const isCommissionRole = role === "master_distributor" || role === "super_distributor" || role === "distributor";

    return visibleTransactions.filter((tx) => {
      if (nameTerm) {
        const lookup = [
          tx.name,
          tx.user?.name,
          tx.retailer_name,
          tx.created_by_super,
          tx.created_by_distributor,
          tx.description,
          tx.reference,
        ]
          .map((item) => String(item || "").toLowerCase())
          .join(" ");
        if (!lookup.includes(nameTerm)) {
          return false;
        }
      }

      if (selectedDate) {
        const txDate = new Date(tx.created_at);
        if (Number.isNaN(txDate.getTime())) {
          return false;
        }
        const y = txDate.getFullYear();
        const m = String(txDate.getMonth() + 1).padStart(2, "0");
        const d = String(txDate.getDate()).padStart(2, "0");
        if (`${y}-${m}-${d}` !== selectedDate) {
          return false;
        }
      }

      if (!selectedHistoryType || selectedHistoryType === "all") {
        return true;
      }

      const txType = String(tx.type || "").toLowerCase();
      const txDescription = String(tx.description || "").toLowerCase();
      const hasCommission = txType.includes("commission") || txDescription.includes("commission") || tx.commission_amount != null;
      const hasWithdraw = txType.includes("withdraw") || txDescription.includes("withdraw");
      const hasDeposit = txType.includes("deposit") || txType.includes("receive") || txDescription.includes("deposit");

      if (selectedHistoryType === "commission") {
        return hasCommission && !hasWithdraw;
      }
      if (selectedHistoryType === "commission_withdraw") {
        return hasCommission && hasWithdraw;
      }
      if (selectedHistoryType === "deposit") {
        return hasDeposit;
      }
      if (selectedHistoryType === "withdraw") {
        return hasWithdraw;
      }

      return isCommissionRole ? hasCommission || hasWithdraw : true;
    });
  }, [visibleTransactions, transactionHistoryFilter, role]);

  const retailerPayinTransactions = useMemo(
    () => visibleTransactions.filter((tx) => String(tx.type || "").toLowerCase() !== "withdraw"),
    [visibleTransactions]
  );

  const filteredRetailerPayins = useMemo(() => {
    const term = retailerPayinSearch.trim().toLowerCase();
    return retailerPayinTransactions.filter((tx) => {
      const status = String(tx.status || "completed").toLowerCase();
      if (retailerPayinStatusFilter !== "all" && status !== retailerPayinStatusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      const lookup = [tx.id, tx.reference, tx.type, tx.description, tx.amount, tx.status]
        .map((item) => String(item || "").toLowerCase())
        .join(" ");
      return lookup.includes(term);
    });
  }, [retailerPayinTransactions, retailerPayinSearch, retailerPayinStatusFilter]);

  const filteredRetailerPayouts = useMemo(() => {
    const term = retailerPayoutSearch.trim().toLowerCase();
    return retailerWithdrawRequests.filter((wr) => {
      const status = String(wr.status || "pending").toLowerCase();
      if (retailerPayoutStatusFilter !== "all" && status !== retailerPayoutStatusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      const lookup = [wr.id, wr.reference, wr.transaction_id, wr.remarks, wr.amount, wr.net_amount, wr.status]
        .map((item) => String(item || "").toLowerCase())
        .join(" ");
      return lookup.includes(term);
    });
  }, [retailerWithdrawRequests, retailerPayoutSearch, retailerPayoutStatusFilter]);

  const payoutStats = useMemo(() => {
    const statusList = filteredRetailerPayouts.map((item) => String(item.status || "pending").toLowerCase());
    return {
      totalVolume: filteredRetailerPayouts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      processedCount: statusList.filter((status) => ["approved", "completed", "success", "processed"].includes(status)).length,
      pendingCount: statusList.filter((status) => ["pending", "processing", "initiated"].includes(status)).length,
      failedCount: statusList.filter((status) => ["failed", "rejected", "cancelled", "declined", "error"].includes(status)).length,
      netVolume: filteredRetailerPayouts.reduce((sum, item) => sum + Number(item.net_amount || 0), 0),
    };
  }, [filteredRetailerPayouts]);

  const hasActiveRetailerFilters =
    retailerHistoryFilter !== "all" ||
    Boolean(transactionFilters.type || transactionFilters.start_date || transactionFilters.end_date || retailerPayinSearch.trim()) ||
    retailerPayinStatusFilter !== "all" ||
    Boolean(retailerPayoutSearch.trim()) ||
    retailerPayoutStatusFilter !== "all";

  const hasActiveTransactionHistoryFilter =
    Boolean(transactionHistoryFilter.name.trim() || transactionHistoryFilter.date) ||
    transactionHistoryFilter.history_type !== "all";

  const payinStats = useMemo(() => {
    const statusList = filteredRetailerPayins.map((item) => String(item.status || "completed").toLowerCase());
    return {
      totalVolume: filteredRetailerPayins.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      successCount: statusList.filter((status) => ["approved", "completed", "success", "processed"].includes(status)).length,
      pendingCount: statusList.filter((status) => ["pending", "processing", "initiated"].includes(status)).length,
      failedCount: statusList.filter((status) => ["failed", "rejected", "cancelled", "declined", "error"].includes(status)).length,
    };
  }, [filteredRetailerPayins]);

  const rechargeOperatorSource = useMemo(() => {
    if (selectedRechargeService === "dth") return DTH_OPERATORS;
    if (selectedRechargeService === "metro") return METRO_OPERATORS;
    if (selectedRechargeService === "broadband") return BROADBAND_PROVIDERS;
    if (selectedRechargeService === "education") return EDUCATION_INSTITUTES;
    if (selectedRechargeService === "insurance") return INSURANCE_PROVIDERS;
    if (selectedRechargeService === "pay-loan") return LOAN_PROVIDERS;
    return RECHARGE_OPERATORS;
  }, [
    selectedRechargeService,
    DTH_OPERATORS,
    METRO_OPERATORS,
    BROADBAND_PROVIDERS,
    EDUCATION_INSTITUTES,
    INSURANCE_PROVIDERS,
    LOAN_PROVIDERS,
    RECHARGE_OPERATORS,
  ]);

  const filteredRechargeOperators = useMemo(() => {
    const term = rechargeOperatorSearch.trim().toLowerCase();
    if (!term) {
      return rechargeOperatorSource;
    }
    return rechargeOperatorSource.filter((operator) => {
      const lookup = `${operator.key} ${operator.title} ${operator.mark}`.toLowerCase();
      return lookup.includes(term);
    });
  }, [rechargeOperatorSource, rechargeOperatorSearch]);

  const selectedMobilePlanSuggestions = useMemo(
    () =>
      RECHARGE_PLAN_SUGGESTIONS[rechargeOperator] ||
      RECHARGE_QUICK_AMOUNTS.slice(0, 3).map((amount) => ({
        amount,
        validity: "Popular",
        benefits: "Tap to auto-fill amount",
      })),
    [rechargeOperator, RECHARGE_PLAN_SUGGESTIONS, RECHARGE_QUICK_AMOUNTS]
  );

  const showDistributorUsersSection =
    role === "distributor" && (activeSection === "retailers" || (activeSection === "user-management" && userManagementTab === "users"));
  const showMasterUsersSection =
    (role === "master_distributor" || role === "super_distributor") &&
    (activeSection === "distributors" || (activeSection === "user-management" && userManagementTab === "users"));

  return {
    totalWalletBalance,
    mainWallet,
    recentTransactions,
    visibleTransactions,
    filteredNonRetailerTransactions,
    retailerPayinTransactions,
    filteredRetailerPayins,
    filteredRetailerPayouts,
    payoutStats,
    hasActiveRetailerFilters,
    hasActiveTransactionHistoryFilter,
    payinStats,
    rechargeOperatorSource,
    filteredRechargeOperators,
    selectedMobilePlanSuggestions,
    showDistributorUsersSection,
    showMasterUsersSection,
  };
};
