export const sortTransactionsByDateDesc = (items) =>
  [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

export const mapDistributorCommissionTransactions = (items = []) =>
  items.map((item) => ({
    id: `comm-${item.id}`,
    type: "commission",
    amount: item.commission_amount,
    status: "completed",
    reference: item.reference,
    description: item.description,
    created_at: item.created_at,
  }));

export const mapManagerCommissionTransactions = (items = [], prefix, includeSuperHierarchy = false) =>
  items.map((item) => ({
    id: `${prefix}-${item.id}`,
    type: "commission",
    amount: item.commission_amount,
    commission_amount: item.commission_amount,
    deposit_amount: item.original_amount ?? item.original_transaction?.amount ?? 0,
    status: "completed",
    reference: item.reference,
    description: item.description,
    created_at: item.created_at,
    retailer_name: item.original_transaction?.user?.name || "-",
    created_by_distributor: item.original_transaction?.user?.distributor?.name || "-",
    ...(includeSuperHierarchy
      ? {
          created_by_super:
            item.original_transaction?.user?.distributor?.distributor?.name || "-",
        }
      : {}),
  }));

export const mapRetailerCommissionTransactions = (items = []) =>
  items.map((item) => ({
    id: `rcomm-${item.id}`,
    type: "commission",
    amount: item.commission_amount,
    status: "completed",
    reference: item.reference,
    description: item.description,
    created_at: item.created_at,
  }));

export const createRetailerCommissionDraft = (retailers = []) => {
  const initialCommissionDraft = {};
  retailers.forEach((retailer) => {
    initialCommissionDraft[retailer.id] = retailer.commission_override?.distributor_commission ?? "";
  });
  return initialCommissionDraft;
};

export const validateCreateBasicPayload = (payload) => {
  if (!payload.name || !payload.email || !payload.password || !payload.password_confirmation || !payload.date_of_birth || !payload.phone) {
    return "Please fill all required basic details";
  }
  if (payload.password !== payload.password_confirmation) {
    return "Password and confirm password must match";
  }
  if (String(payload.phone || "").length !== 10) {
    return "Mobile number must be 10 digits";
  }
  return null;
};

export const handleImageFileSelection = ({
  field,
  file,
  setFormState,
  setPreviewState,
}) => {
  setFormState((prev) => ({ ...prev, [field]: file || null }));

  if (!file || !String(file.type || "").startsWith("image/")) {
    setPreviewState((prev) => ({ ...prev, [field]: "" }));
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewState((prev) => ({ ...prev, [field]: String(reader.result || "") }));
  };
  reader.readAsDataURL(file);
};

export const getRechargeSubmissionFeedback = ({
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
  broadbandAmount,
  educationInstitute,
  educationStudentId,
  educationAmount,
  insuranceProvider,
  insurancePolicyNumber,
  insuranceAmount,
  loanProvider,
  loanAccountNumber,
  loanAmount,
  rechargeOperator,
  rechargeMobile,
  rechargeAmount,
}) => {
  if (selectedRechargeService !== "prepaid-postpaid") {
    return { error: "Only mobile prepaid recharge is available right now." };
  }

  if (!rechargeOperator || !rechargeMobile || !rechargeAmount) {
    return { error: "Please fill all recharge details" };
  }

  return {
    success: `Recharge request captured for ${rechargeOperator}`,
  };
};

export const buildTransactionFilterParams = (filters = {}) => {
  const params = {};
  if (filters.type) params.type = filters.type;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  return params;
};

export const downloadCsv = (rows, fileName) => {
  const escapeCsv = (value) => {
    const safeValue = String(value ?? "");
    if (safeValue.includes(",") || safeValue.includes("\"") || safeValue.includes("\n")) {
      return `"${safeValue.replace(/"/g, '""')}"`;
    }
    return safeValue;
  };

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
