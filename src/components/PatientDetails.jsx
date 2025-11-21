import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  db,
  updateDoc,
} from "../firebase";
import "../css/PatientDetails.module.css";
import PaymentModal from "./PaymentModal";

function PatientDetails() {
  const { id } = useParams(); // Get patient ID from URL
  const [patient, setPatient] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Define fetchPaymentHistory function outside of useEffect
  const fetchPaymentHistory = async () => {
    try {
      if (patient && patient.name) {
        console.log("Fetching payment history for:", patient.name); // Debug log
        const q = query(
          collection(db, "payments"),
          where("patient", "==", patient.name)
        );
        const querySnapshot = await getDocs(q);
        const paymentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Payment history fetched:", paymentsList); // Debug log
        setPaymentHistory(paymentsList);
      } else {
        console.log("Patient name not available for querying.");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, "patients", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatient(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    };

    fetchPatient();
  }, [id]);

  useEffect(() => {
    // Call fetchPaymentHistory when patient data is available
    if (patient && patient.name) {
      fetchPaymentHistory();
    }
  }, [patient]);

  // Function to mark payment as fully paid
  const markAsPaid = async (paymentId) => {
    try {
      const paymentRef = doc(db, "payments", paymentId);
      await updateDoc(paymentRef, { isFullyPaid: true });
      fetchPaymentHistory(); // Refresh payment history
    } catch (error) {
      console.error("Error marking payment as fully paid:", error);
    }
  };
  const handlePayClick = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleModalSave = async (amountPaid, paymentDate) => {
    if (!selectedPayment) return;

    const newAmountPaid = parseFloat(amountPaid);
    const remainingBalance = selectedPayment.remainingBalance - newAmountPaid;
    const isFullyPaid = remainingBalance <= 0;

    try {
      const paymentRef = doc(db, "payments", selectedPayment.id);
      await updateDoc(paymentRef, {
        amountPaid: selectedPayment.amountPaid + newAmountPaid,
        remainingBalance: isFullyPaid ? 0 : remainingBalance,
        isFullyPaid,
        timestamp: new Date(paymentDate),
      });
      Swal.fire("Success!", `Payment Successful.`, "success");
      fetchPaymentHistory(); // Refresh payment history
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  return (
    <div className="container">
      <div className="row g-2 d-flex justify-content-center">
        <div className="col-md-6">
          {patient ? (
            <div className="card shadow-sm p-3 mb-3">
              <h4 className="text-center mb-3">Patient Details</h4>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Name:</strong> {patient.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {patient.address}
                  </p>
                  <p>
                    <strong>Number:</strong> {patient.number}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Gender:</strong> {patient.gender}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {patient.dob}
                  </p>
                  <p>
                    <strong>Allergies:</strong> {patient.allergies}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <hr />
      <div className="row">
        <h1 className="text-center">Payment History</h1>
        <div className="col-md-12">
          {paymentHistory.length > 0 ? (
            <table className="table table-responsive">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Treatment</th>
                  <th>Discount</th>
                  <th>Total Cost</th>
                  <th>Amount Paid</th>
                  <th>Remaining Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {new Date(
                        payment.timestamp.toDate()
                      ).toLocaleDateString()}
                    </td>
                    {/* <td>{Number(payment.amountPaid).toFixed(2)}</td> */}
                    {payment.treatments && payment.treatments.length > 0
                      ? payment.treatments.map((treatment, index) => (
                          <span key={index}>{treatment.name}</span>
                        ))
                      : "N/A"}
                    <td>{payment.discount}%</td>
                    {/* <td>{payment.totalCost.toFixed(2)}</td> */}
                    <td>
                      {payment.totalCost
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td>
                      {payment.amountPaid
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td>
                      {payment.remainingBalance
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td>
                      {payment.isFullyPaid ? (
                        <button className="btn btn-sm btn-success">
                          Fully Paid
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-warning">
                            Pending
                          </button>{" "}
                          &nbsp;
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handlePayClick(payment)}
                          >
                            Pay
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payment history available.</p>
          )}
        </div>
      </div>
      <PaymentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        payment={selectedPayment}
      />
    </div>
  );
}

export default PatientDetails;
