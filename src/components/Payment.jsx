import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../css/Payment.css";

function Payment() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [formattedAmountPaid, setFormattedAmountPaid] = useState("0");
  const [discount, setDiscount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [formattedTotalCost, setFormattedTotalCost] = useState("0");
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  useEffect(() => {
    const db = getFirestore();

    const fetchPatients = async () => {
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientsData);
    };

    const fetchTreatments = async () => {
      const treatmentsSnapshot = await getDocs(collection(db, "treatments"));
      const treatmentsData = treatmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTreatments(treatmentsData);
    };

    fetchPatients();
    fetchTreatments();
  }, []);

  const handleTreatmentChange = (e, treatment) => {
    const { checked } = e.target;
    setSelectedTreatments((prev) =>
      checked
        ? [...prev, { ...treatment, quantity: 1 }]
        : prev.filter((t) => t.id !== treatment.id)
    );
  };

  const handleQuantityChange = (e, treatmentId) => {
    const qty = parseInt(e.target.value, 10);
    setSelectedTreatments((prev) =>
      prev.map((t) => (t.id === treatmentId ? { ...t, quantity: qty } : t))
    );
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;

    // allow empty string (user deleting)
    setDiscountInput(value);

    // convert to number or 0
    const numeric = value === "" ? 0 : parseFloat(value);
    setDiscount(numeric);
    calculateTotalCost(selectedTreatments, numeric);
  };

  const calculateTotalCost = (treatments, disc) => {
    if (treatments.length > 0) {
      const cost = treatments.reduce(
        (total, treatment) =>
          total + Number(treatment.cost) * treatment.quantity,
        0
      );
      const total = cost - (cost * (isNaN(disc) ? 0 : disc)) / 100;
      setTotalCost(total);
      setFormattedTotalCost(formatNumberWithCommas(total.toFixed(2)));
    }
  };

  const handleAmountPaidChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) || value === "") {
      setAmountPaid(value === "" ? 0 : parsedValue);
      setFormattedAmountPaid(value === "" ? "" : formatNumberWithCommas(value));
    }
  };

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    try {
      const remainingBalance = totalCost - amountPaid;
      const isFullyPaid = remainingBalance <= 0;

      await addDoc(collection(db, "payments"), {
        patient: selectedPatient,
        treatments: selectedTreatments.map((t) => ({
          name: t.name,
          quantity: t.quantity,
        })),
        amountPaid,
        discount,
        totalCost,
        remainingBalance,
        timestamp: new Date(),
        isFullyPaid,
      });

      console.log("Payment successfully added!");
      Swal.fire("Success!", `Payment Successful.`, "success");

      // Optionally reset the form or redirect
      setSelectedPatient(null);
      setSelectedTreatments([]);
      setAmountPaid(0);
      setFormattedAmountPaid("0");
      setDiscount(0);
      setTotalCost(0);
      setFormattedTotalCost("0");
    } catch (error) {
      console.error("Error adding payment: ", error);
      Swal.fire("Error!", "Payment Error", "error");
    }
  };

  useEffect(() => {
    calculateTotalCost(selectedTreatments, discount);
  }, [selectedTreatments, discount]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(treatmentSearch.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-center">Payment</h1>
      <div className="container payment__label">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="patientSearch" className="form-label">
              Search Patient
            </label>
            <input
              type="text"
              className="form-control"
              id="patientSearch"
              placeholder="Search Patient"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            <label htmlFor="patientName" className="form-label mt-2">
              Patient Name
            </label>
            <select
              className="form-select"
              id="patientName"
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
            >
              <option value="">Select Patient</option>
              {filteredPatients.map((patient) => (
                <option key={patient.id} value={patient.name}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="treatmentSearch" className="form-label">
              Search Treatment
            </label>
            <input
              type="text"
              className="form-control"
              id="treatmentSearch"
              placeholder="Search Treatment"
              value={treatmentSearch}
              onChange={(e) => setTreatmentSearch(e.target.value)}
            />
            <label htmlFor="treatment" className="form-label mt-2">
              Treatment
            </label>
            <div id="treatment" className="scrollable-treatments">
              {filteredTreatments.map((treatment) => (
                <div key={treatment.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={treatment.id}
                    id={`treatment-${treatment.id}`}
                    onChange={(e) => handleTreatmentChange(e, treatment)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`treatment-${treatment.id}`}
                  >
                    {treatment.name}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id={`quantity-${treatment.id}`}
                    value={
                      selectedTreatments.find((t) => t.id === treatment.id)
                        ?.quantity || 1
                    }
                    onChange={(e) => handleQuantityChange(e, treatment.id)}
                    min="1"
                    style={{
                      display: "inline",
                      width: "auto",
                      marginLeft: "10px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="discount" className="form-label">
              Discount (%)
            </label>
            <input
              type="number"
              className="form-control"
              id="discount"
              value={discountInput}
              onChange={handleDiscountChange}
              min="0"
              max="100"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="totalCost" className="form-label">
              Total Cost
            </label>
            <input
              type="text"
              className="form-control"
              id="totalCost"
              value={formattedTotalCost}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label htmlFor="amountPaid" className="form-label">
              Amount Paid
            </label>
            <input
              type="text"
              className="form-control"
              id="amountPaid"
              value={formattedAmountPaid}
              onChange={handleAmountPaidChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
