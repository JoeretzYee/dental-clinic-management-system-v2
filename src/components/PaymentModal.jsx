import React, { useState } from "react";
import "../css/PaymentModal.css";

function PaymentModal({ show, onClose, onSave, payment }) {
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().substr(0, 10)
  );

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePaidAmountChange = (e) => {
    let value = e.target.value;

    // Remove all commas first
    value = value.replace(/,/g, "");

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Format with commas
    const formatted = formatWithCommas(value);

    setPaidAmount(formatted);
  };

  const handleSave = () => {
    // Remove commas before saving
    const rawAmount = paidAmount.replace(/,/g, "");
    onSave(rawAmount, paymentDate);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="paymentModalOverlay">
      <div className="paymentModalContent">
        <h2>Make a Payment</h2>

        {/* Amount Input */}
        <div className="paymentModalFormGroup">
          <label>Amount Paid</label>
          <input
            type="text"
            className="form-control"
            value={paidAmount}
            onChange={handlePaidAmountChange}
            placeholder="Enter amount"
          />
        </div>

        {/* Date Input */}
        <div className="paymentModalFormGroup">
          <label>Payment Date</label>
          <input
            type="date"
            className="form-control"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        <button
          className="btn paymentModalBtn btn-primary"
          onClick={handleSave}
        >
          Save
        </button>

        <button className="btn paymentModalBtn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;
