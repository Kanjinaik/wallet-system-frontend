import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";

const PAYMENT_METHOD_LABELS = {
  payumoney: "PayU Money",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
};

const DepositModal = ({ show, onClose, onSuccess }) => {
  const [wallets, setWallets] = useState([]);
  const [walletLoadError, setWalletLoadError] = useState("");
  const [depositData, setDepositData] = useState({
    wallet_id: "",
    amount: "",
    payment_method: "payumoney",
  });
  const [loading, setLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setWalletLoadError("");
        const response = await api.get("/wallets");
        const allWalletsData = Array.isArray(response.data) ? response.data : [];

        if (allWalletsData.length === 0) {
          setWallets([]);
          setDepositData((prev) => ({
            ...prev,
            wallet_id: "",
          }));
          setWalletLoadError("No wallet is available for deposit.");
          return;
        }

        setWallets(allWalletsData);

        const mainWallet = allWalletsData.find((wallet) => wallet.type === "main");
        const selectedWalletExists = allWalletsData.some(
          (wallet) => String(wallet.id) === String(depositData.wallet_id)
        );

        if (selectedWalletExists) {
          return;
        }

        if (mainWallet) {
          setDepositData((prev) => ({
            ...prev,
            wallet_id: mainWallet.id,
          }));
          return;
        }

        setDepositData((prev) => ({
          ...prev,
          wallet_id: allWalletsData[0]?.id ?? "",
        }));
      } catch (error) {
        console.error("Deposit Modal - Failed to fetch wallets:", error);
        const firstValidationError = error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0]?.[0]
          : null;
        const message = firstValidationError || error.response?.data?.message || "Failed to fetch wallets";
        toast.error(message);
        setWalletLoadError(message);
        setWallets([]);
        setDepositData((prev) => ({
          ...prev,
          wallet_id: "",
        }));
      }
    };

    if (show) {
      fetchWallets();
    } else {
      setConfirmationOpen(false);
    }
  }, [show, depositData.wallet_id]);

  const handleChange = (e) => {
    setDepositData({
      ...depositData,
      [e.target.name]: e.target.value,
    });
  };

  const validateDepositInput = () => {
    const normalizedWalletId = Number(depositData.wallet_id);
    const normalizedAmount = Number(depositData.amount);

    if (!Number.isFinite(normalizedWalletId) || normalizedWalletId <= 0) {
      toast.error("Please select a valid wallet");
      return null;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1) {
      toast.error("Minimum deposit amount is Rs 1");
      return null;
    }

    if (normalizedAmount > 100000) {
      toast.error("Maximum deposit amount is Rs 100000");
      return null;
    }

    return { normalizedWalletId, normalizedAmount };
  };

  const handleReviewDeposit = (e) => {
    e.preventDefault();
    if (!validateDepositInput()) {
      return;
    }
    setConfirmationOpen(true);
  };

  const resetFlow = () => {
    setDepositData({ wallet_id: "", amount: "", payment_method: "payumoney" });
    setConfirmationOpen(false);
  };

  const handleDeposit = async () => {
    const validated = validateDepositInput();
    if (!validated) {
      return;
    }

    setLoading(true);

    const { normalizedWalletId, normalizedAmount } = validated;

    try {
      const paymentMethod = depositData.payment_method || "payumoney";

      if (paymentMethod !== "payumoney") {
        const response = await api.post("/deposit", {
          wallet_id: normalizedWalletId,
          amount: normalizedAmount,
          payment_method: paymentMethod,
        });

        if (response.data.success) {
          toast.success(
            `Deposit of Rs ${normalizedAmount.toFixed(2)} successful! New balance: Rs ${response.data.data.new_balance}`
          );
          resetFlow();
          onClose();
          if (onSuccess) onSuccess();
        } else {
          toast.error(response.data.message || "Deposit failed");
        }
        return;
      }

      const orderResponse = await api.post("/deposit/create-order", {
        wallet_id: normalizedWalletId,
        amount: normalizedAmount,
        firstname: selectedWallet?.name || "",
        return_url: `${window.location.origin}${window.location.pathname}`,
      });

      const gateway = orderResponse.data?.gateway || "payu";
      if (gateway !== "payu") {
        toast.error(orderResponse.data?.message || "PayU Money is not configured for deposits.");
        return;
      }

      const paymentUrl = orderResponse.data?.payment_url;
      const formFields = orderResponse.data?.form_fields;
      if (!paymentUrl || !formFields) {
        toast.error("Failed to initialize PayU Money payment.");
        return;
      }

      submitGatewayForm(paymentUrl, formFields);
    } catch (error) {
      console.error("Deposit error:", error);
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  if (!show) return null;

  const selectedWallet = wallets.find((wallet) => String(wallet.id) === String(depositData.wallet_id));

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Deposit Funds
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {!confirmationOpen ? (
              <form onSubmit={handleReviewDeposit}>
                {walletLoadError && (
                  <div className="alert alert-warning" role="alert">
                    {walletLoadError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Select Wallet</label>
                  <select
                    className="form-select"
                    name="wallet_id"
                    value={depositData.wallet_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose wallet...</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} (Balance: Rs {parseFloat(wallet.balance || 0).toFixed(2)})
                        {wallet.is_frozen ? " - FROZEN" : ""}
                      </option>
                    ))}
                    {wallets.length === 0 && (
                      <option disabled className="text-muted">
                        No wallets available
                      </option>
                    )}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Amount (Rs)</label>
                  <div className="input-group">
                    <span className="input-group-text">Rs</span>
                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={depositData.amount}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Quick Amount</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {[100, 500, 1000, 2000, 5000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setDepositData((prev) => ({ ...prev, amount }))}
                      >
                        Rs {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={loading || !depositData.wallet_id || !depositData.amount || wallets.length === 0}
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Continue
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div
                  className="rounded-4 p-4 mb-4"
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="text-uppercase fw-bold small text-primary mb-1">Confirm Deposit</div>
                      <h6 className="mb-0 fw-bold">Review details before payment</h6>
                    </div>
                    <span className="badge text-bg-light border">Secure gateway</span>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="bg-white rounded-4 p-3 border">
                        <div className="small text-muted mb-1">Wallet</div>
                        <div className="fw-semibold">{selectedWallet?.name || "--"}</div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="bg-white rounded-4 p-3 border h-100">
                        <div className="small text-muted mb-1">Amount</div>
                        <div className="fw-bold fs-4">Rs {Number(depositData.amount || 0).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="bg-white rounded-4 p-3 border h-100">
                        <div className="small text-muted mb-1">Payment Method</div>
                        <div className="fw-semibold">
                          {PAYMENT_METHOD_LABELS[depositData.payment_method] || "Online Gateway"}
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="alert alert-light border mb-0">
                        Click <strong>Pay Now</strong> to continue to the payment gateway, or <strong>Cancel</strong> to go back and edit the form.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={() => setConfirmationOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success flex-grow-1"
                    onClick={handleDeposit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
