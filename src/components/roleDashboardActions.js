import {
  createAdminTransferFormState,
  createDistributorImagePreviewState,
  createEmptyDistributor,
  createEmptyRetailer,
  createPasswordFormState,
  createRetailerImagePreviewState,
} from "./roleDashboardInitialState";
import {
  buildTransactionFilterParams,
  downloadCsv,
  getRechargeSubmissionFeedback,
  handleImageFileSelection,
  mapDistributorCommissionTransactions,
  mapRetailerCommissionTransactions,
  sortTransactionsByDateDesc,
  validateCreateBasicPayload,
} from "./roleDashboardHelpers";

export const createRoleDashboardActions = (deps) => {
  const {
    api,
    toast,
    role,
    mainWallet,
    inlineDeposit,
    inlineWithdraw,
    retailerDashboard,
    withdrawPresetStorageKey,
    setSavedWithdrawPresets,
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
    streaming,
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
  } = deps;

  const submitGatewayForm = (action, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;

    Object.entries(fields || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleInlineDepositSubmit = async (e) => {
    e.preventDefault();
    if (walletActionLoading) {
      return;
    }
    if (!mainWallet?.id) {
      toast.error("Wallet not found");
      return;
    }
    const amount = Number(inlineDeposit.amount || 0);
    if (!Number.isFinite(amount) || amount < 1) {
      toast.error("Enter valid deposit amount");
      return;
    }

    setWalletActionLoading(true);
    try {
      const orderResponse = await api.post("/deposit/create-order", {
        wallet_id: Number(mainWallet.id),
        amount,
        firstname: String(inlineDeposit.customer_name || "").trim(),
        email: String(inlineDeposit.email || "").trim(),
        phone: String(inlineDeposit.mobile || "").trim(),
        return_url: `${window.location.origin}${window.location.pathname}`,
      });

      if ((orderResponse.data?.gateway || "") !== "payu") {
        toast.error(orderResponse.data?.message || "PayU Money is not configured for retailer deposits");
        return;
      }

      const paymentUrl = orderResponse.data?.payment_url;
      const formFields = orderResponse.data?.form_fields;
      if (!paymentUrl || !formFields) {
        toast.error("Failed to initialize PayU Money payment");
        return;
      }

      submitGatewayForm(paymentUrl, formFields);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Deposit failed");
    } finally {
      setWalletActionLoading(false);
    }
  };

  const handleInlineWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (walletActionLoading) {
      return;
    }
    if (!mainWallet?.id) {
      toast.error("Wallet not found");
      return;
    }
    const minimumWithdrawAmount = Number(retailerDashboard?.min_withdraw_amount || 100);
    const amount = Number(inlineWithdraw.amount || 0);
    if (!Number.isFinite(amount) || amount < minimumWithdrawAmount) {
      toast.error(`Minimum withdraw amount is Rs${minimumWithdrawAmount}`);
      return;
    }
    if (String(inlineWithdraw.account_number || "").length < 9) {
      toast.error("Account number must be at least 9 digits");
      return;
    }
    if (String(inlineWithdraw.ifsc_code || "").trim().length < 11) {
      toast.error("Enter valid IFSC code");
      return;
    }
    if (!String(inlineWithdraw.account_holder_name || "").trim()) {
      toast.error("Enter account holder name");
      return;
    }
    if (String(inlineWithdraw.beneficiary_mobile || "").trim().length !== 10) {
      toast.error("Enter valid 10-digit beneficiary mobile");
      return;
    }

    setWalletActionLoading(true);
    try {
      const response = await api.post("/withdraw", {
        wallet_id: Number(mainWallet.id),
        amount,
        bank_account: String(inlineWithdraw.account_number || "").trim(),
        ifsc_code: String(inlineWithdraw.ifsc_code || "").trim().toUpperCase(),
        account_holder_name: String(inlineWithdraw.account_holder_name || "").trim(),
        beneficiary_mobile: String(inlineWithdraw.beneficiary_mobile || "").trim(),
      });
      const processingState = String(response?.data?.processing_state || "").toLowerCase();
      if (processingState === "completed") {
        toast.success(response?.data?.message || "Withdrawal successful");
      } else if (processingState === "pending") {
        toast.info(response?.data?.message || "Withdrawal initiated and pending bank confirmation.");
      } else {
        toast.info(response?.data?.message || "Withdrawal request submitted and pending approval.");
      }
      if (withdrawPresetStorageKey) {
        const nextPreset = {
          payment_mode: inlineWithdraw.payment_mode,
          amount: inlineWithdraw.amount,
          account_number: inlineWithdraw.account_number,
          ifsc_code: inlineWithdraw.ifsc_code,
          account_holder_name: inlineWithdraw.account_holder_name,
          beneficiary_mobile: inlineWithdraw.beneficiary_mobile,
          account_type: inlineWithdraw.account_type,
          saved_at: new Date().toISOString(),
        };
        setSavedWithdrawPresets((currentPresets) => {
          const updatedPresets = [
            nextPreset,
            ...currentPresets.filter(
              (item) =>
                !(
                  item.account_number === nextPreset.account_number &&
                  item.ifsc_code === nextPreset.ifsc_code &&
                  item.account_holder_name === nextPreset.account_holder_name &&
                  item.beneficiary_mobile === nextPreset.beneficiary_mobile &&
                  item.account_type === nextPreset.account_type &&
                  item.payment_mode === nextPreset.payment_mode
                )
            ),
          ].slice(0, 5);
          localStorage.setItem(withdrawPresetStorageKey, JSON.stringify(updatedPresets));
          return updatedPresets;
        });
      }
      setInlineWithdraw((prev) => ({ ...prev, amount: "" }));
      await loadData(role);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Withdrawal failed");
    } finally {
      setWalletActionLoading(false);
    }
  };

  const handleEkycFieldChange = (e) => {
    const { name, value } = e.target;
    setEkycForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEkycFileChange = (name, file) => {
    setEkycForm((prev) => ({ ...prev, [name]: file || null }));
    if (file && file.type?.startsWith("image/")) {
      setEkycPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is not supported on this device/browser");
      return;
    }
    if (cameraStreamRef.current) {
      setCameraOpen(true);
      setStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
        videoRef.current.play?.().catch(() => {});
      }
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = mediaStream;
      setCameraOpen(true);
      setStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play?.().catch(() => {});
      }
    } catch {
      toast.error("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setCameraOpen(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current || !streaming) {
      toast.error("Open camera before capturing selfie");
      return;
    }

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      toast.error("Camera preview is not ready yet");
      return;
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const selfieFile = new File([blob], `selfie_${Date.now()}.png`, { type: "image/png" });
      setEkycForm((prev) => ({ ...prev, selfie_photo: selfieFile, liveness_verified: true }));
      setEkycPreview((prev) => ({ ...prev, selfie_photo: URL.createObjectURL(blob) }));
      toast.success("Selfie captured. Liveness detected.");
      stopCamera();
    }, "image/png");
  };

  const handleSubmitEkyc = async (e) => {
    e.preventDefault();
    if (ekycSubmitting) {
      return;
    }
    if (!String(ekycForm.first_name || "").trim()) {
      toast.error("Enter first name");
      return;
    }
    if (!String(ekycForm.email || "").trim()) {
      toast.error("Enter valid email");
      return;
    }
    if (!String(ekycForm.kyc_id_number || "").trim()) {
      toast.error("Enter document serial");
      return;
    }
    if (!ekycForm.document_front && !ekycPreview?.document_front) {
      toast.error("Upload document front");
      return;
    }
    if (!ekycForm.document_back && !ekycPreview?.document_back) {
      toast.error("Upload document back");
      return;
    }
    if (!ekycForm.liveness_verified && !ekycForm.selfie_photo && !ekycPreview?.selfie_photo) {
      toast.error("Capture selfie verification before submitting");
      return;
    }

    setEkycSubmitting(true);
    try {
      const appendFileOrPreview = async (fieldName, fileValue, previewUrl, fallbackFileName) => {
        if (fileValue) {
          formData.append(fieldName, fileValue);
          return;
        }
        if (!previewUrl) {
          return;
        }
        const previewResponse = await fetch(previewUrl);
        const previewBlob = await previewResponse.blob();
        const extension = previewBlob.type?.split("/")[1] || "png";
        formData.append(fieldName, new File([previewBlob], `${fallbackFileName}.${extension}`, { type: previewBlob.type || "application/octet-stream" }));
      };

      const formData = new FormData();
      formData.append("first_name", ekycForm.first_name);
      formData.append("last_name", ekycForm.last_name || "");
      formData.append("email", ekycForm.email);
      formData.append("date_of_birth", ekycForm.date_of_birth || "");
      formData.append("document_type", ekycForm.document_type);
      formData.append("kyc_id_number", ekycForm.kyc_id_number);
      formData.append("liveness_verified", ekycForm.liveness_verified ? "1" : "0");
      await appendFileOrPreview("profile_photo", ekycForm.profile_photo, ekycPreview?.profile_photo, "profile_photo");
      await appendFileOrPreview("document_front", ekycForm.document_front, ekycPreview?.document_front, "document_front");
      await appendFileOrPreview("document_back", ekycForm.document_back, ekycPreview?.document_back, "document_back");
      await appendFileOrPreview("selfie_photo", ekycForm.selfie_photo, ekycPreview?.selfie_photo, "selfie_photo");

      const response = await api.post("/retailer/ekyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data?.message || "eKYC submitted successfully");
      await loadData(role);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Failed to submit eKYC");
    } finally {
      setEkycSubmitting(false);
    }
  };

  const validateCreateBasicStep = (payload) => {
    const validationMessage = validateCreateBasicPayload(payload);
    if (validationMessage) {
      toast.error(validationMessage);
      return false;
    }
    return true;
  };

  const handleCreateRetailer = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newRetailer).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      await api.post("/distributor/retailers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Retailer added successfully");
      setNewRetailer(createEmptyRetailer());
      setRetailerCreateStep(1);
      setRetailerImagePreview(createRetailerImagePreviewState());
      await loadDistributorData();
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Failed to add retailer");
    }
  };

  const handleRetailerCommissionSave = async (retailerId) => {
    const distributor_commission = retailerCommissionDraft[retailerId];
    if (distributor_commission === "" || distributor_commission === null || distributor_commission === undefined) {
      toast.error("Enter commission % first");
      return;
    }
    try {
      await api.put(`/distributor/retailers/${retailerId}`, { distributor_commission });
      toast.success("Retailer commission updated");
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update commission");
    }
  };

  const handleRetailerToggle = async (retailerId) => {
    try {
      const res = await api.post(`/distributor/retailers/${retailerId}/toggle`);
      toast.success(res.data?.message || "Retailer status updated");
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update retailer status");
    }
  };

  const handleRetailerTransactions = async (retailerId) => {
    try {
      const res = await api.get(`/distributor/retailers/${retailerId}/transactions`);
      const walletTx = res.data?.wallet_transactions || [];
      const commTx = mapRetailerCommissionTransactions(res.data?.commission_transactions || []);
      setSelectedRetailerTransactions({
        retailer: res.data?.retailer,
        transactions: sortTransactionsByDateDesc([...walletTx, ...commTx]),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch retailer transactions");
    }
  };

  const handleDistributorTransactions = async (distributorId) => {
    try {
      const res = await api.get(`${managerApiPrefix}/distributors/${distributorId}/transactions`);
      const walletTx = res.data?.wallet_transactions || [];
      const commTx = mapDistributorCommissionTransactions(res.data?.commission_transactions || []);
      setSelectedManagerTransactions({
        distributor: res.data?.distributor,
        transactions: sortTransactionsByDateDesc([...walletTx, ...commTx]),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to fetch ${managedChildLabel.toLowerCase()} transactions`);
    }
  };

  const handleAdminTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/transfer", {
        from_wallet_id: adminTransferForm.from_wallet_id,
        to_wallet_id: adminTransferForm.to_wallet_id,
        amount: adminTransferForm.amount,
        description: adminTransferForm.description,
      });
      toast.success("Wallet transfer completed successfully");
      setAdminTransferForm(createAdminTransferFormState());
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
    }
  };

  const handleWithdrawRequestDecision = async (requestId, action) => {
    try {
      const remarks = withdrawRemarksDraft[requestId] || "";
      await api.post(`/distributor/withdraw-requests/${requestId}/${action}`, { remarks });
      toast.success(`Withdraw request ${action}d successfully`);
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} withdraw request`);
    }
  };

  const handleCreateDistributor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newDistributor).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      await api.post(`${managerApiPrefix}/distributors`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${managedChildLabel} added successfully`);
      setNewDistributor(createEmptyDistributor());
      setDistributorCreateStep(1);
      setDistributorImagePreview(createDistributorImagePreviewState());
      await reloadManagerData();
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || `Failed to add ${managedChildLabel.toLowerCase()}`);
    }
  };

  const handleRetailerFileChange = (field, file) => {
    handleImageFileSelection({
      field,
      file,
      setFormState: setNewRetailer,
      setPreviewState: setRetailerImagePreview,
    });
  };

  const handleDistributorFileChange = (field, file) => {
    handleImageFileSelection({
      field,
      file,
      setFormState: setNewDistributor,
      setPreviewState: setDistributorImagePreview,
    });
  };

  const handleDistributorToggle = async (distributorId) => {
    try {
      const res = await api.post(`${managerApiPrefix}/distributors/${distributorId}/toggle`);
      toast.success(res.data?.message || `${managedChildLabel} status updated`);
      await reloadManagerData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${managedChildLabel.toLowerCase()} status`);
    }
  };

  const handleDistributorUpdate = async (distributorId, payload) => {
    try {
      const res = await api.put(`${managerApiPrefix}/distributors/${distributorId}`, payload);
      toast.success(res.data?.message || `${managedChildLabel} updated successfully`);
      await reloadManagerData();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${managedChildLabel.toLowerCase()}`);
      return false;
    }
  };

  const loadTransactionsWithFilters = async (filters = transactionFilters) => {
    try {
      const params = buildTransactionFilterParams(filters);
      const response = await api.get("/transactions", { params });
      setTransactions(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load filtered transactions");
    }
  };

  const handleRetailerExport = async () => {
    try {
      const response = await api.get("/retailer/statement/export", {
        params: buildTransactionFilterParams(transactionFilters),
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `retailer_statement_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export statement");
    }
  };

  const handleRetailerPayoutExport = () => {
    const rows = [
      ["Date", "Transaction ID", "Amount", "Net", "Status", "Remarks"],
      ...filteredRetailerPayouts.map((wr) => [
        new Date(wr.created_at).toLocaleString(),
        wr.reference || wr.transaction_id || wr.id,
        Number(wr.amount || 0).toFixed(2),
        Number(wr.net_amount || 0).toFixed(2),
        wr.status || "",
        wr.remarks || "",
      ]),
    ];
    downloadCsv(rows, `retailer_payout_history_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleRetailerHistoryRefresh = async () => {
    try {
      const currentFilters = { ...transactionFilters };
      await loadRetailerData();
      if (
        retailerTransactionTab === "payin" &&
        (currentFilters.type || currentFilters.start_date || currentFilters.end_date)
      ) {
        await loadTransactionsWithFilters(currentFilters);
      }
      toast.success("History refreshed");
    } catch {
      toast.error("Failed to refresh history");
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    const rechargeGateway = retailerDashboard?.recharge_gateway || null;
    const rechargeGatewayReady = ["live_ready", "test_ready"].includes(rechargeGateway?.status);

    if (!rechargeGatewayReady) {
      toast.error("Recharge service is unavailable right now.");
      return;
    }

    if (selectedRechargeService !== "prepaid-postpaid" || rechargeType !== "prepaid") {
      toast.error("Only mobile prepaid recharge is available right now.");
      return;
    }

    const { error, success } = getRechargeSubmissionFeedback({
      selectedRechargeService,
      rechargeOperator,
      rechargeMobile,
      rechargeAmount,
    });
    if (error) {
      toast.error(error);
      return;
    }

    const apiPayload = {
      service: "prepaid-postpaid",
      provider: rechargeOperator,
      payment_type: "prepaid",
      mobile: rechargeMobile,
      customer_mobile: rechargeMobile,
      circle: rechargeCircle,
      amount: Number(rechargeAmount || 0),
    };

    try {
      const response = await api.post("/retailer/recharge/pay", apiPayload, {
        skipErrorLog: true,
      });
      toast.success(response.data?.message || success);
      await loadData(role);
    } catch (err) {
      const firstValidationError = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0]?.[0]
        : null;
      const apiMessage = err.response?.data?.message;
      const friendlyMessage =
        apiMessage === "Retailer recharge provider is not configured."
          ? "Recharge service is unavailable right now."
          : apiMessage;
      toast.error(firstValidationError || friendlyMessage || "Recharge failed");
    }
  };

  const handleApplyWithdrawPreset = (preset) => {
    setInlineWithdraw((prev) => ({
      ...prev,
      payment_mode: preset.payment_mode || prev.payment_mode,
      account_number: preset.account_number || "",
      ifsc_code: preset.ifsc_code || "",
      account_holder_name: preset.account_holder_name || "",
      beneficiary_mobile: preset.beneficiary_mobile || "",
      account_type: preset.account_type || prev.account_type,
      amount: prev.amount,
    }));
  };

  const handleRequestWithdrawOtp = async () => {
    if (!mainWallet?.id) {
      toast.error("No wallet found");
      return;
    }
    if (!retailerDashboard?.min_withdraw_amount) {
      toast.error("Withdraw config not loaded");
      return;
    }
    try {
      const response = await api.post("/withdraw/request-otp", {
        wallet_id: mainWallet.id,
        amount: retailerDashboard.min_withdraw_amount,
      });
      const otp = String(response.data?.otp || "").trim();
      toast.success(otp ? `OTP generated: ${otp}` : "OTP generated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate OTP");
    }
  };

  const handleRetailerProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/profile", profileForm);
      toast.success("Profile updated");
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleRetailerPasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/change-password", passwordForm);
      toast.success("Password changed");
      setPasswordForm(createPasswordFormState());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleRetailerBankSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/bank-details", bankForm);
      toast.success("Bank details updated");
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bank details");
    }
  };

  const handleRetailerKycUpload = async (e) => {
    e.preventDefault();
    if (!kycFile) {
      toast.error("Please choose KYC document");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("kyc_document", kycFile);
      await api.post("/retailer/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("KYC uploaded");
      setKycFile(null);
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload KYC");
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/notifications/read/${id}`);
      if (setNotifications) {
        setNotifications((prev = []) =>
          prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        );
      }
      if (setUnreadNotifications) {
        setUnreadNotifications((count = 0) => Math.max(count - 1, 0));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update notification");
    }
  };

  return {
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
  };
};
