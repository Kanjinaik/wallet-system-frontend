import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import AdminDashboardSection from "./AdminDashboardSection";
import DistributorDashboardSection from "./DistributorDashboardSection";
import MasterDistributorDashboardSection from "./MasterDistributorDashboardSection";
import RetailerDashboardSection from "./RetailerDashboardSection";
import RoleSidebar from "./RoleSidebar";
import RoleHeader from "./RoleHeader";
import RoleTransactionsSection from "./RoleTransactionsSection";
import RoleProfileSection from "./RoleProfileSection";
import RoleNotificationsSection from "./RoleNotificationsSection";
import RetailerChat from "./RetailerChat";
import RoleDistributorUsersSection from "./RoleDistributorUsersSection";
import RoleManagerUsersSection from "./RoleManagerUsersSection";
import RoleWalletSection from "./RoleWalletSection";
import RoleRechargeSection from "./RoleRechargeSection";
import RoleDistributorRolesSection from "./RoleDistributorRolesSection";
import RoleDistributorPerformanceSection from "./RoleDistributorPerformanceSection";
import RoleManagerRolesSection from "./RoleManagerRolesSection";
import RoleDistributorWithdrawalsSection from "./RoleDistributorWithdrawalsSection";
import AdminReportsSection from "./AdminReportsSection";
import ManagerReportsSection from "./ManagerReportsSection";
import SupportTickets from "./SupportTickets";
import { createRoleDashboardActions } from "./roleDashboardActions";
import { createRoleDashboardData } from "./roleDashboardData";
import { useRoleDashboardSelectors } from "./useRoleDashboardSelectors";
import {
  createAdminTransferFormState,
  createBankFormState,
  createDistributorImagePreviewState,
  createEmptyDistributor,
  createEmptyRetailer,
  createEkycFormState,
  createEkycPreviewState,
  createInlineDepositState,
  createInlineWithdrawState,
  createPasswordFormState,
  createProfileFormState,
  createRetailerImagePreviewState,
  createTransactionFilters,
  createTransactionHistoryFilter,
} from "./roleDashboardInitialState";
import {
  INDIA_STATES,
  KYC_DOCUMENT_TYPES,
  RECHARGE_SERVICES,
  RECHARGE_OPERATORS,
  ELECTRICITY_BOARD_OPTIONS,
  DTH_OPERATORS,
  METRO_OPERATORS,
  BROADBAND_PROVIDERS,
  EDUCATION_INSTITUTES,
  INSURANCE_PROVIDERS,
  LOAN_PROVIDERS,
  RECHARGE_QUICK_AMOUNTS,
  RECHARGE_PLAN_SUGGESTIONS,
  ROLE_LABELS,
  formatCurrency,
  getInitials,
  toProfileImageUrl
} from "./constants";
import "./role-dashboard.css";

const COMPANY_NAME = "XENN TECH";
const COMPANY_TAGLINE = "";

const RoleDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [masterDistributorData, setMasterDistributorData] = useState(null);
  const [superDistributorData, setSuperDistributorData] = useState(null);
  const [distributorData, setDistributorData] = useState(null);
  const [distributorPerformance, setDistributorPerformance] = useState(null);
  const [distributorWithdrawRequests, setDistributorWithdrawRequests] = useState([]);
  const [selectedRetailerTransactions, setSelectedRetailerTransactions] = useState(null);
  const [selectedManagerTransactions, setSelectedManagerTransactions] = useState(null);
  const [retailerCommissionDraft, setRetailerCommissionDraft] = useState({});
  const [withdrawRemarksDraft, setWithdrawRemarksDraft] = useState({});
  const [newRetailer, setNewRetailer] = useState(createEmptyRetailer);
  const [retailerImagePreview, setRetailerImagePreview] = useState(createRetailerImagePreviewState);
  const [newDistributor, setNewDistributor] = useState(createEmptyDistributor);
  const [retailerCreateStep, setRetailerCreateStep] = useState(1);
  const [distributorCreateStep, setDistributorCreateStep] = useState(1);
  const [distributorImagePreview, setDistributorImagePreview] = useState(createDistributorImagePreviewState);
  const [adminTransferForm, setAdminTransferForm] = useState(createAdminTransferFormState);
  const [retailerDashboard, setRetailerDashboard] = useState(null);
  const [retailerWithdrawRequests, setRetailerWithdrawRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState(createTransactionFilters);
  const [retailerPayinSearch, setRetailerPayinSearch] = useState("");
  const [retailerPayoutSearch, setRetailerPayoutSearch] = useState("");
  const [retailerPayinStatusFilter, setRetailerPayinStatusFilter] = useState("all");
  const [retailerPayoutStatusFilter, setRetailerPayoutStatusFilter] = useState("all");
  const [retailerHistoryFilter, setRetailerHistoryFilter] = useState("all");
  const [transactionHistoryFilter, setTransactionHistoryFilter] = useState(createTransactionHistoryFilter);
  const [isTransactionFilterOpen, setIsTransactionFilterOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(createProfileFormState);
  const [passwordForm, setPasswordForm] = useState(createPasswordFormState);
  const [bankForm, setBankForm] = useState(createBankFormState);
  const [kycFile, setKycFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [reportsData, setReportsData] = useState({
    summary: {},
    earnings: [],
    distributor_performance: [],
    rows: [],
    filters: { distributors: [], retailers: [] },
  });
  const [reportsFilters, setReportsFilters] = useState({
    fromDate: "",
    toDate: "",
    distributorId: "all",
    retailerId: "all",
    status: "all",
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isLiveReportsEnabled, setIsLiveReportsEnabled] = useState(true);
  const [liveReportIntervalSec, setLiveReportIntervalSec] = useState(30);
  const [reportFilters, setReportFilters] = useState({
    dateFrom: "",
    dateTo: "",
    userId: "all",
    transactionType: "all",
    paymentMethod: "all",
    status: "all",
  });
  const [retailerTransactionTab, setRetailerTransactionTab] = useState("payouts");
  const [userManagementTab, setUserManagementTab] = useState("users");
  const [walletActionTab, setWalletActionTab] = useState("deposit");
  const [rechargeType, setRechargeType] = useState("prepaid");
  const [selectedRechargeService, setSelectedRechargeService] = useState("prepaid-postpaid");
  const [rechargeOperator, setRechargeOperator] = useState("");
  const [rechargeCircle, setRechargeCircle] = useState("Andhra Pradesh");
  const [rechargeOperatorSearch, setRechargeOperatorSearch] = useState("");
  const [rechargeMobile, setRechargeMobile] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [electricityBillType, setElectricityBillType] = useState("apartments");
  const [electricityState, setElectricityState] = useState("Andhra Pradesh");
  const [electricityBoard, setElectricityBoard] = useState(ELECTRICITY_BOARD_OPTIONS[0]);
  const [electricityCity, setElectricityCity] = useState("");
  const [electricityApartment, setElectricityApartment] = useState("");
  const [electricityFlatNo, setElectricityFlatNo] = useState("");
  const [electricityMobile, setElectricityMobile] = useState("");
  const [electricityServiceNumber, setElectricityServiceNumber] = useState("");
  const [electricityAmount, setElectricityAmount] = useState("");
  const [dthOperator, setDthOperator] = useState(DTH_OPERATORS[0].key);
  const [dthSubscriberId, setDthSubscriberId] = useState("");
  const [dthOperatorPickerOpen, setDthOperatorPickerOpen] = useState(false);
  const [metroOperator, setMetroOperator] = useState(METRO_OPERATORS[0].key);
  const [metroCardNumber, setMetroCardNumber] = useState("");
  const [metroAmount, setMetroAmount] = useState("");
  const [broadbandProvider, setBroadbandProvider] = useState(BROADBAND_PROVIDERS[0].key);
  const [broadbandAccountId, setBroadbandAccountId] = useState("");
  const [broadbandMobile, setBroadbandMobile] = useState("");
  const [broadbandAmount, setBroadbandAmount] = useState("");
  const [educationInstitute, setEducationInstitute] = useState(EDUCATION_INSTITUTES[0].key);
  const [educationStudentId, setEducationStudentId] = useState("");
  const [educationAmount, setEducationAmount] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState(INSURANCE_PROVIDERS[0].key);
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [insuranceMobile, setInsuranceMobile] = useState("");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [loanProvider, setLoanProvider] = useState(LOAN_PROVIDERS[0].key);
  const [loanAccountNumber, setLoanAccountNumber] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [inlineDeposit, setInlineDeposit] = useState(createInlineDepositState);
  const [inlineWithdraw, setInlineWithdraw] = useState(createInlineWithdrawState);
  const [savedWithdrawPresets, setSavedWithdrawPresets] = useState([]);
  const [ekycForm, setEkycForm] = useState(createEkycFormState);
  const [ekycPreview, setEkycPreview] = useState(createEkycPreviewState);
  const [ekycSubmitting, setEkycSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [walletActionLoading, setWalletActionLoading] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const role = user?.role === "user" ? "retailer" : user?.role;
  const isMasterRole = role === "master_distributor";
  const isSuperRole = role === "super_distributor";
  const isManagerRole = isMasterRole || isSuperRole;
  const managedChildLabel = isMasterRole ? "Super Distributor" : "Distributor";
  const managerApiPrefix = isSuperRole ? "/super-distributor" : "/master-distributor";
  const managerData = isSuperRole ? superDistributorData : masterDistributorData;
  const displayName = profile?.name || user?.name || "User";
  const displayRole = ROLE_LABELS[role] || "User";
  const withdrawPresetStorageKey = useMemo(
    () => (user?.id ? `wallet_saved_withdraw_presets_${user.id}` : ""),
    [user?.id]
  );
  const profileInitials = useMemo(() => getInitials(displayName), [displayName]);
  const profileImageUrl = useMemo(
    () => toProfileImageUrl(profile?.profile_photo_url || profile?.profile_photo_path || user?.profile_photo_url || user?.profile_photo_path),
    [profile?.profile_photo_url, profile?.profile_photo_path, user?.profile_photo_url, user?.profile_photo_path]
  );

  const {
    loadRetailerData,
    loadAdminData,
    loadDistributorData,
    loadData,
    reloadManagerData,
  } = createRoleDashboardData({
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
  });
  const loadDataRef = useRef(loadData);

  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    if (location.pathname.includes("/reports")) {
      setActiveSection("reports");
    } else if (location.pathname.includes("/support")) {
      setActiveSection("support");
    } else if (location.pathname.includes("/notifications")) {
      setActiveSection("notifications");
    }
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(rawUser);
    setUser(parsed);
    if (parsed.role === "user") {
      setActiveSection("recharge");
    }
    loadDataRef.current(parsed.role === "user" ? "retailer" : parsed.role);
  }, [navigate]);

  useEffect(() => {
    const onWindowClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (!notificationMenuRef.current?.contains(event.target)) {
        setIsNotificationMenuOpen(false);
      }
    };
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  useEffect(() => {
    if (!withdrawPresetStorageKey) {
      setSavedWithdrawPresets([]);
      return;
    }

    try {
      const rawPresets = localStorage.getItem(withdrawPresetStorageKey);
      const parsedPresets = rawPresets ? JSON.parse(rawPresets) : [];
      setSavedWithdrawPresets(Array.isArray(parsedPresets) ? parsedPresets : []);
    } catch {
      setSavedWithdrawPresets([]);
    }
  }, [withdrawPresetStorageKey]);

  useEffect(() => {
    if (role !== "admin" || activeSection !== "dashboard" || !isLiveReportsEnabled) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      loadAdminData();
    }, Math.max(10, Number(liveReportIntervalSec || 30)) * 1000);

    return () => window.clearInterval(interval);
  }, [role, activeSection, isLiveReportsEnabled, liveReportIntervalSec, loadAdminData]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      const list = res.data?.notifications || res.data || [];
      setNotifications(list);
      setUnreadNotifications(res.data?.unread_count ?? list.filter((n) => !n.is_read).length);
    } catch (error) {
      // avoid noisy toasts; silently fail
      console.warn("notification fetch failed", error?.message);
    }
  }, []);

  const markAllNotificationsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev = []) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear notifications");
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 20000);
    return () => window.clearInterval(interval);
  }, [user, loadNotifications]);

  useEffect(() => {
    setUnreadNotifications((notifications || []).filter((n) => !n.is_read).length);
  }, [notifications]);

  const handleReportFilterChange = (key, value) => {
    setReportFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetReportFilters = () => {
    setReportFilters({
      dateFrom: "",
      dateTo: "",
      userId: "all",
      transactionType: "all",
      paymentMethod: "all",
      status: "all",
    });
  };

  const loadManagerReports = useCallback(async (nextFilters = reportsFilters) => {
    if (!isSuperRole && !isMasterRole) return;
    setReportsLoading(true);
    try {
      const res = await api.get("/reports", { params: nextFilters });
      const data = res.data || {};
      setReportsData({
        summary: data.summary || {},
        earnings: data.earnings || [],
        distributor_performance: data.distributor_performance || [],
        rows: data.rows || [],
        filters: data.filters || { distributors: [], retailers: [] },
      });
      setReportsFilters(nextFilters);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  }, [isMasterRole, isSuperRole, reportsFilters]);

  useEffect(() => {
    if ((isSuperRole || isMasterRole) && activeSection === "reports") {
      loadManagerReports();
    }
  }, [activeSection, isSuperRole, isMasterRole, loadManagerReports]);

  const {
    totalWalletBalance,
    mainWallet,
    recentTransactions,
    filteredNonRetailerTransactions,
    filteredRetailerPayins,
    filteredRetailerPayouts,
    payoutStats,
    hasActiveRetailerFilters,
    hasActiveTransactionHistoryFilter,
    payinStats,
    filteredRechargeOperators,
    selectedMobilePlanSuggestions,
    showDistributorUsersSection,
    showMasterUsersSection,
  } = useRoleDashboardSelectors({
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
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileMenuAction = (section) => {
    setActiveSection(section);
    setIsProfileMenuOpen(false);
  };

  const handleRetailerQuickAction = (action) => {
    if (action === "add") {
      setActiveSection("wallet");
      setWalletActionTab("deposit");
      return;
    }
    if (action === "withdraw") {
      setActiveSection("wallet");
      setWalletActionTab("withdraw");
      return;
    }
    if (action === "qr") {
      setActiveSection("recharge");
      return;
    }
    setActiveSection("dashboard");
  };

  useEffect(() => {
    const defaultName = profile?.name || user?.name || "";
    const defaultEmail = profile?.email || user?.email || "";
    const defaultPhone = String(profile?.phone || user?.phone || "").replace(/\D/g, "").slice(0, 10);

    setInlineDeposit((prev) => ({
      ...prev,
      customer_name: prev.customer_name || defaultName,
      email: prev.email || defaultEmail,
      mobile: prev.mobile || defaultPhone,
      transaction_date: prev.transaction_date || new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    }));

    setInlineWithdraw((prev) => ({
      ...prev,
      account_holder_name: prev.account_holder_name || defaultName,
      beneficiary_mobile: prev.beneficiary_mobile || defaultPhone,
    }));

    setEkycForm((prev) => ({
      ...prev,
      first_name: prev.first_name || defaultName.split(' ')[0] || "",
      last_name: prev.last_name || defaultName.split(' ').slice(1).join(' ') || "",
      email: prev.email || defaultEmail,
      date_of_birth: prev.date_of_birth || profile?.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : "",
      kyc_id_number: prev.kyc_id_number || profile?.kyc_id_number || "",
      document_type: prev.document_type || profile?.kyc_document_type || "aadhaar",
      liveness_verified: Boolean(prev.liveness_verified || profile?.kyc_liveness_verified),
    }));

    // Load existing KYC document images
    const existingImages = {};
    if (profile?.kyc_photo_path) {
      existingImages.profile_photo = `${window.location.origin}/storage/${profile.kyc_photo_path}`;
    }
    if (profile?.kyc_document_path) {
      existingImages.document_front = `${window.location.origin}/storage/${profile.kyc_document_path}`;
    }
    if (profile?.profile_photo_path) {
      existingImages.selfie_photo = `${window.location.origin}/storage/${profile.profile_photo_path}`;
    }
    setEkycPreview((prev) => ({ ...prev, ...existingImages }));
  }, [profile, user]);

  const {
    handleInlineDepositSubmit,
    handleInlineWithdrawSubmit,
    handleEkycFieldChange,
    handleEkycFileChange,
    openCamera,
    stopCamera,
    captureSelfie,
    handleSubmitEkyc,
    validateCreateBasicStep,
    handleCreateRetailer,
    handleRetailerCommissionSave,
    handleRetailerToggle,
    handleRetailerTransactions,
    handleDistributorTransactions,
    handleAdminTransfer,
    handleWithdrawRequestDecision,
    handleCreateDistributor,
    handleRetailerFileChange,
    handleDistributorFileChange,
    handleDistributorUpdate,
    handleDistributorToggle,
    loadTransactionsWithFilters,
    handleRetailerExport,
    handleRetailerPayoutExport,
    handleRetailerHistoryRefresh,
    handleRechargeSubmit,
    handleApplyWithdrawPreset,
    handleRequestWithdrawOtp,
    handleRetailerProfileSave,
    handleRetailerPasswordChange,
    handleRetailerBankSave,
    handleRetailerKycUpload,
    markNotificationRead,
  } = createRoleDashboardActions({
    api,
    toast,
    role,
    mainWallet,
    inlineDeposit,
    inlineWithdraw,
    retailerDashboard,
    withdrawPresetStorageKey,
    setSavedWithdrawPresets,
    setInlineDeposit,
    setInlineWithdraw,
      setWalletActionLoading,
      loadData,
      setEkycForm,
      setEkycPreview,
      ekycPreview,
      videoRef,
      canvasRef,
      cameraStreamRef,
      setCameraOpen,
      setStreaming,
      ekycForm,
      walletActionLoading,
      setEkycSubmitting,
      ekycSubmitting,
      newRetailer,
    setNewRetailer,
    setRetailerCreateStep,
    setRetailerImagePreview,
    loadDistributorData,
    retailerCommissionDraft,
    setSelectedRetailerTransactions,
    setSelectedManagerTransactions,
    adminTransferForm,
    setAdminTransferForm,
    loadAdminData,
    withdrawRemarksDraft,
    newDistributor,
    setNewDistributor,
    managedChildLabel,
    managerApiPrefix,
    setDistributorCreateStep,
    setDistributorImagePreview,
    reloadManagerData,
    transactionFilters,
    setTransactions,
    filteredRetailerPayouts,
    retailerTransactionTab,
    loadRetailerData,
    selectedRechargeService,
    electricityBillType,
    electricityCity,
    electricityApartment,
    electricityFlatNo,
    electricityMobile,
    electricityState,
    electricityBoard,
    electricityServiceNumber,
    electricityAmount,
    dthOperator,
    dthSubscriberId,
    metroOperator,
    metroCardNumber,
    metroAmount,
    broadbandProvider,
    broadbandAccountId,
    broadbandMobile,
    broadbandAmount,
    educationInstitute,
    educationStudentId,
    educationAmount,
    insuranceProvider,
    insurancePolicyNumber,
    insuranceMobile,
    insuranceAmount,
    loanProvider,
    loanAccountNumber,
    loanAmount,
    rechargeOperator,
    rechargeMobile,
    rechargeCircle,
    rechargeAmount,
    rechargeType,
    profileForm,
    passwordForm,
    setPasswordForm,
    bankForm,
    kycFile,
    setKycFile,
    setNotifications,
    setUnreadNotifications,
  });


  if (loading) {
    return (
      <div className="role-luxury-loader">
        <div className="loader-brand-ring">
          <div className="loader-spinner" />
          <div className="loader-logo">XT</div>
        </div>
        <div className="loader-text">Securing your session...</div>
      </div>
    );
  }

  const pageClasses = ["role-page"];
  if (role === "retailer") pageClasses.push("role-page-retailer");
  if (isManagerRole || role === "distributor") pageClasses.push("role-page-manager");

  const retailerNotifications = role === "retailer" ? notifications : [];

  return (
    <div className={`${pageClasses.join(" ")} ${isCollapsed ? 'collapsed' : ''}`}>
      <RoleSidebar
        ctx={{
          role,
          activeSection,
          userManagementTab,
          retailerTransactionTab,
          setActiveSection,
          setUserManagementTab,
          setRetailerTransactionTab,
          walletActionTab,
          companyName: COMPANY_NAME,
          companyTagline: COMPANY_TAGLINE,
          displayRole,
          setWalletActionTab,
          handleLogout,
          isCollapsed,
          setIsCollapsed,
        }}
      />

      <main className={`role-main ${role === "retailer" ? "role-main-retailer" : ""}`}>
        <RoleHeader
          ctx={{
            role,
            isProfileMenuOpen,
            profileMenuRef,
            setIsProfileMenuOpen,
            displayName,
            displayRole,
            profileImageUrl,
            profileInitials,
            handleProfileMenuAction,
            handleLogout,
            notifications,
            unreadNotifications,
            isNotificationMenuOpen,
            setIsNotificationMenuOpen,
            notificationMenuRef,
            markNotificationRead,
            markAllNotificationsRead,
            refreshNotifications: loadNotifications,
          }}
        />

        {activeSection === "dashboard" && (
          <>
            {role === "admin" && (
              <AdminDashboardSection
                activeSection={activeSection}
                adminStats={adminStats}
                adminUsers={adminUsers}
                wallets={wallets}
                adminTransferForm={adminTransferForm}
                setAdminTransferForm={setAdminTransferForm}
                handleAdminTransfer={handleAdminTransfer}
                recentTransactions={recentTransactions}
              />
            )}
            {role === "distributor" && (
              <DistributorDashboardSection
                activeSection={activeSection}
                distributorData={distributorData}
                distributorPerformance={distributorPerformance}
                recentTransactions={recentTransactions}
                transactions={transactions}
                wallets={wallets}
                notifications={notifications}
                onViewTransactions={() => setActiveSection("transactions")}
                onViewWallet={() => setActiveSection("wallet")}
                onManageUsers={() => {
                  setActiveSection("user-management");
                  setUserManagementTab("users");
                }}
                onViewWithdrawRequests={() => setActiveSection("withdrawals")}
              />
            )}
            {(role === "master_distributor" || role === "super_distributor") && (
              <MasterDistributorDashboardSection
                activeSection={activeSection}
                managerData={managerData}
                isMasterRole={isMasterRole}
                recentTransactions={recentTransactions}
                transactions={transactions}
                onAddDistributor={() => {
                  setActiveSection("user-management");
                  setUserManagementTab("users");
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                onAddRetailer={() => {
                  setActiveSection("user-management");
                  setUserManagementTab("roles");
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                onAddTransaction={() => setActiveSection("transactions")}
                onViewTransactions={() => setActiveSection("transactions")}
                onViewWallet={() => {
                  setActiveSection("wallet");
                  setWalletActionTab("deposit");
                }}
              />
            )}
          </>
        )}
        {role === "retailer" && ["dashboard", "support", "reports"].includes(activeSection) && (
          <RetailerDashboardSection
            activeSection={activeSection}
            retailerDashboard={retailerDashboard}
            mainWallet={mainWallet}
            recentTransactions={recentTransactions}
            transactions={transactions}
            notifications={retailerNotifications}
            payinStats={payinStats}
            payoutStats={payoutStats}
            profile={profile}
            onQuickAction={handleRetailerQuickAction}
            onViewTransactions={() => {
              setActiveSection("transactions");
              setRetailerTransactionTab("payouts");
            }}
            onViewWallet={() => setActiveSection("wallet")}
          />
        )}



        <RoleDistributorUsersSection
          ctx={{
            showDistributorUsersSection,
            handleCreateRetailer,
            retailerCreateStep,
            setRetailerCreateStep,
            newRetailer,
            setNewRetailer,
            validateCreateBasicStep,
            handleRetailerFileChange,
            retailerImagePreview,
            INDIA_STATES,
            KYC_DOCUMENT_TYPES,
            distributorData,
            formatCurrency,
            retailerCommissionDraft,
            setRetailerCommissionDraft,
            handleRetailerCommissionSave,
            handleRetailerToggle,
            handleRetailerTransactions,
            selectedRetailerTransactions,
          }}
        />

        <RoleDistributorRolesSection
          ctx={{
            role,
            activeSection,
            userManagementTab,
            distributorData,
            distributorWithdrawRequests,
            user,
          }}
        />

        <RoleWalletSection
          ctx={{
            role,
            activeSection,
            formatCurrency,
            distributorData,
            managerData,
            retailerDashboard,
            mainWallet,
            walletActionTab,
            setWalletActionTab,
            handleInlineDepositSubmit,
            handleInlineWithdrawSubmit,
            inlineDeposit,
            setInlineDeposit,
            inlineWithdraw,
            setInlineWithdraw,
            profile,
            savedWithdrawPresets,
            handleApplyWithdrawPreset,
            walletActionLoading,
            ekycForm,
            handleEkycFieldChange,
            handleEkycFileChange,
            ekycPreview,
            openCamera,
            captureSelfie,
            stopCamera,
            streaming,
            cameraOpen,
            videoRef,
            canvasRef,
            cameraStreamRef,
            handleSubmitEkyc,
            ekycSubmitting,
            handleRequestWithdrawOtp,
          }}
        />

        <RoleDistributorPerformanceSection
          ctx={{
            role,
            activeSection,
            distributorPerformance,
            formatCurrency,
          }}
        />

        <RoleManagerUsersSection
          ctx={{
            showMasterUsersSection,
            managedChildLabel,
            handleCreateDistributor,
            distributorCreateStep,
            setDistributorCreateStep,
            newDistributor,
            setNewDistributor,
            validateCreateBasicStep,
            handleDistributorFileChange,
            INDIA_STATES,
            KYC_DOCUMENT_TYPES,
            distributorImagePreview,
            managerData,
            formatCurrency,
            handleDistributorUpdate,
            handleDistributorToggle,
            handleDistributorTransactions,
            selectedManagerTransactions,
            setSelectedManagerTransactions,
          }}
        />

        <RoleManagerRolesSection
          ctx={{
            role,
            activeSection,
            userManagementTab,
            isMasterRole,
            managerData,
            user,
          }}
        />

        <RoleDistributorWithdrawalsSection
          ctx={{
            role,
            activeSection,
            distributorWithdrawRequests,
            formatCurrency,
            withdrawRemarksDraft,
            setWithdrawRemarksDraft,
            handleWithdrawRequestDecision,
          }}
        />

        <RoleTransactionsSection
          ctx={{
            activeSection,
            role,
            retailerTransactionTab,
            isTransactionFilterOpen,
            hasActiveTransactionHistoryFilter,
            setIsTransactionFilterOpen,
            hasActiveRetailerFilters,
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
            transactionHistoryFilter,
            setTransactionHistoryFilter,
            filteredNonRetailerTransactions,
          }}
        />

        <AdminReportsSection
          role={role}
          activeSection={activeSection}
          adminStats={adminStats}
          adminUsers={adminUsers}
          transactions={transactions}
          isLive={isLiveReportsEnabled}
          liveIntervalSec={liveReportIntervalSec}
          reportFilters={reportFilters}
          onReportFilterChange={handleReportFilterChange}
          onResetFilters={resetReportFilters}
          onToggleLive={() => setIsLiveReportsEnabled((prev) => !prev)}
          onLiveIntervalChange={setLiveReportIntervalSec}
        />

        <ManagerReportsSection
          ctx={{
            role,
            activeSection,
            reportsData,
            reportsFilters,
            reportsLoading,
            notifications,
            managerData,
            onMarkAllRead: markAllNotificationsRead,
            onFilterChange: (key, value) => setReportsFilters((prev) => ({ ...prev, [key]: value })),
            onReset: () =>
              setReportsFilters({
                fromDate: "",
                toDate: "",
                distributorId: "all",
                retailerId: "all",
                status: "all",
              }),
            onGenerate: () => loadManagerReports(reportsFilters),
          }}
        />

        <RoleRechargeSection
          ctx={{
            role,
            activeSection,
            formatCurrency,
            retailerDashboard,
            mainWallet,
            RECHARGE_SERVICES,
            selectedRechargeService,
            setSelectedRechargeService,
            setRechargeOperatorSearch,
            handleRechargeSubmit,
            electricityBillType,
            setElectricityBillType,
            electricityCity,
            setElectricityCity,
            electricityApartment,
            setElectricityApartment,
            electricityFlatNo,
            setElectricityFlatNo,
            electricityMobile,
            setElectricityMobile,
            electricityState,
            setElectricityState,
            INDIA_STATES,
            electricityBoard,
            setElectricityBoard,
            ELECTRICITY_BOARD_OPTIONS,
            electricityServiceNumber,
            setElectricityServiceNumber,
            electricityAmount,
            setElectricityAmount,
            rechargeOperatorSearch,
            dthOperator,
            setDthOperator,
            dthOperatorPickerOpen,
            setDthOperatorPickerOpen,
            DTH_OPERATORS,
            dthSubscriberId,
            setDthSubscriberId,
            RECHARGE_QUICK_AMOUNTS,
            rechargeAmount,
            setRechargeAmount,
            filteredRechargeOperators,
            metroOperator,
            setMetroOperator,
            metroCardNumber,
            setMetroCardNumber,
            metroAmount,
            setMetroAmount,
            broadbandProvider,
            setBroadbandProvider,
            broadbandAccountId,
            setBroadbandAccountId,
            broadbandMobile,
            setBroadbandMobile,
            broadbandAmount,
            setBroadbandAmount,
            educationInstitute,
            setEducationInstitute,
            educationStudentId,
            setEducationStudentId,
            educationAmount,
            setEducationAmount,
            insuranceProvider,
            setInsuranceProvider,
            insurancePolicyNumber,
            setInsurancePolicyNumber,
            insuranceMobile,
            setInsuranceMobile,
            insuranceAmount,
            setInsuranceAmount,
            loanProvider,
            setLoanProvider,
            loanAccountNumber,
            setLoanAccountNumber,
            loanAmount,
            setLoanAmount,
            rechargeType,
            setRechargeType,
            rechargeMobile,
            setRechargeMobile,
            rechargeCircle,
            setRechargeCircle,
            rechargeOperator,
            setRechargeOperator,
            RECHARGE_OPERATORS,
            selectedMobilePlanSuggestions,
          }}
        />
        <RoleProfileSection
          ctx={{
            activeSection,
            profile,
            user,
            role,
            formatCurrency,
            totalWalletBalance,
            profileForm,
            setProfileForm,
            handleRetailerProfileSave,
            passwordForm,
            setPasswordForm,
            handleRetailerPasswordChange,
            bankForm,
            setBankForm,
            handleRetailerBankSave,
            handleRetailerKycUpload,
            setKycFile,
          }}
        />
        <RoleNotificationsSection
          ctx={{
            role,
            activeSection,
            notifications,
            markNotificationRead,
          }}
        />
        <SupportTickets role={role} activeSection={activeSection} />
        <RetailerChat
          ctx={{
            role,
            activeSection,
            user,
            profile,
          }}
        />
      </main>
    </div>
  );
};

export default RoleDashboard;


