import {
  createRetailerCommissionDraft,
  mapDistributorCommissionTransactions,
  mapManagerCommissionTransactions,
  sortTransactionsByDateDesc,
} from "./roleDashboardHelpers";

export const createRoleDashboardData = ({
  api,
  toast,
  isSuperRole,
  setLoading,
  setWallets,
  setTransactions,
  setProfile,
  setProfileForm,
  setBankForm,
  setRetailerDashboard,
  setRetailerWithdrawRequests,
  setNotifications,
  setAdminStats,
  setAdminUsers,
  setMasterDistributorData,
  setSuperDistributorData,
  setDistributorData,
  setDistributorPerformance,
  setDistributorWithdrawRequests,
  setRetailerCommissionDraft,
}) => {
  const loadRetailerData = async () => {
    const [walletRes, transactionRes, profileRes, dashboardRes, withdrawRes, notificationsRes] = await Promise.all([
      api.get("/wallets"),
      api.get("/transactions"),
      api.get("/profile"),
      api.get("/retailer/dashboard"),
      api.get("/retailer/withdraw-requests"),
      api.get("/notifications"),
    ]);

    const profileData = profileRes.data || null;
    setWallets(walletRes.data || []);
    setTransactions(transactionRes.data || []);
    setProfile(profileData);
    setRetailerDashboard(dashboardRes.data || null);
    setRetailerWithdrawRequests(withdrawRes.data || []);
    setNotifications(notificationsRes.data?.notifications || notificationsRes.data || []);
    setProfileForm({
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      date_of_birth: profileData?.date_of_birth ? String(profileData.date_of_birth).slice(0, 10) : "",
    });
    setBankForm({
      bank_account_name: profileData?.bank_account_name || "",
      bank_account_number: profileData?.bank_account_number || "",
      bank_ifsc_code: profileData?.bank_ifsc_code || "",
      bank_name: profileData?.bank_name || "",
    });
  };

  const loadAdminData = async () => {
    const [dashboardRes, usersRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/wallets"),
      api.get("/admin/transactions"),
      api.get("/profile"),
    ]);

    setAdminStats(dashboardRes.data?.stats || null);
    setAdminUsers(usersRes.data || []);
    setWallets(walletRes.data || []);
    setTransactions(transactionRes.data || []);
    setProfile(profileRes.data || null);
  };

  const loadDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes, withdrawRes, performanceRes] = await Promise.all([
      api.get("/distributor/dashboard"),
      api.get("/wallets"),
      api.get("/distributor/transactions"),
      api.get("/profile"),
      api.get("/distributor/withdraw-requests"),
      api.get("/distributor/performance"),
    ]);

    const dashboard = dashboardRes.data || null;
    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = mapDistributorCommissionTransactions(
      transactionRes.data?.commission_transactions || []
    );

    setDistributorData(dashboard);
    setDistributorPerformance(performanceRes.data || dashboard || null);
    setDistributorWithdrawRequests(withdrawRes.data || []);
    setWallets(walletRes.data || []);
    setTransactions(sortTransactionsByDateDesc([...walletTransactions, ...commissionTransactions]));
    setProfile(profileRes.data || null);
    setRetailerCommissionDraft(createRetailerCommissionDraft(dashboard?.retailers || []));
  };

  const loadMasterDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/master-distributor/dashboard"),
      api.get("/wallets"),
      api.get("/master-distributor/transactions"),
      api.get("/profile"),
    ]);

    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = mapManagerCommissionTransactions(
      transactionRes.data?.commission_transactions || [],
      "mcomm",
      true
    );

    setMasterDistributorData(dashboardRes.data || null);
    setWallets(walletRes.data || []);
    setTransactions(sortTransactionsByDateDesc([...walletTransactions, ...commissionTransactions]));
    setProfile(profileRes.data || null);
  };

  const loadSuperDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/super-distributor/dashboard"),
      api.get("/wallets"),
      api.get("/super-distributor/transactions"),
      api.get("/profile"),
    ]);

    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = mapManagerCommissionTransactions(
      transactionRes.data?.commission_transactions || [],
      "scomm"
    );

    setSuperDistributorData(dashboardRes.data || null);
    setWallets(walletRes.data || []);
    setTransactions(sortTransactionsByDateDesc([...walletTransactions, ...commissionTransactions]));
    setProfile(profileRes.data || null);
  };

  const loadData = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === "admin") {
        await loadAdminData();
      } else if (targetRole === "master_distributor") {
        await loadMasterDistributorData();
      } else if (targetRole === "super_distributor") {
        await loadSuperDistributorData();
      } else if (targetRole === "distributor") {
        await loadDistributorData();
      } else {
        await loadRetailerData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const reloadManagerData = async () => {
    if (isSuperRole) {
      await loadSuperDistributorData();
      return;
    }
    await loadMasterDistributorData();
  };

  return {
    loadRetailerData,
    loadAdminData,
    loadDistributorData,
    loadMasterDistributorData,
    loadSuperDistributorData,
    loadData,
    reloadManagerData,
  };
};
