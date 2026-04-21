export const createEmptyRetailer = () => ({
  name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  date_of_birth: "",
  phone: "",
  alternate_mobile: "",
  business_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gst_number: "",
  kyc_document_type: "Aadhaar",
  kyc_id_number: "",
  pan_number: "",
  profile_photo: null,
  kyc_photo: null,
  address_proof_front: null,
  address_proof_back: null,
  pan_proof_front: null,
  pan_proof_back: null,
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_name: "",
  admin_commission: "",
  distributor_commission: "",
  mobility_check: "low",
});

export const createRetailerImagePreviewState = () => ({
  profile_photo: "",
  address_proof_front: "",
  address_proof_back: "",
  kyc_photo: "",
  pan_proof_front: "",
  pan_proof_back: "",
});

export const createEmptyDistributor = () => ({
  name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  date_of_birth: "",
  phone: "",
  alternate_mobile: "",
  business_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gst_number: "",
  kyc_document_type: "Aadhaar",
  kyc_id_number: "",
  pan_number: "",
  profile_photo: null,
  kyc_photo: null,
  address_proof_front: null,
  address_proof_back: null,
  pan_proof_front: null,
  pan_proof_back: null,
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_name: "",
  admin_commission: "",
  distributor_commission: "",
  mobility_check: "low",
});

export const createDistributorImagePreviewState = () => ({
  profile_photo: "",
  address_proof_front: "",
  address_proof_back: "",
  kyc_photo: "",
  pan_proof_front: "",
  pan_proof_back: "",
});

export const createAdminTransferFormState = () => ({
  from_wallet_id: "",
  to_wallet_id: "",
  amount: "",
  description: "",
});

export const createTransactionFilters = () => ({
  type: "",
  start_date: "",
  end_date: "",
});

export const createTransactionHistoryFilter = () => ({
  name: "",
  date: "",
  history_type: "all",
});

export const createProfileFormState = () => ({
  name: "",
  phone: "",
  date_of_birth: "",
});

export const createPasswordFormState = () => ({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

export const createBankFormState = () => ({
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_name: "",
});

export const createInlineDepositState = () => ({
  customer_name: "",
  mobile: "",
  email: "",
  amount: "",
  category: "education",
  transaction_date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
});

export const createInlineWithdrawState = () => ({
  payment_mode: "IMPS",
  amount: "",
  account_number: "",
  ifsc_code: "",
  account_holder_name: "",
  beneficiary_mobile: "",
  account_type: "Savings Account",
});

export const createEkycFormState = () => ({
  first_name: "",
  last_name: "",
  email: "",
  date_of_birth: "",
  document_type: "aadhaar",
  kyc_id_number: "",
  profile_photo: null,
  document_front: null,
  document_back: null,
  selfie_photo: null,
  liveness_verified: false,
});

export const createEkycPreviewState = () => ({
  profile_photo: "",
  document_front: "",
  document_back: "",
  selfie_photo: "",
});
