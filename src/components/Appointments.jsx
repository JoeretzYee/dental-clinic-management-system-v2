import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "../firebase";
import "../css/Appointments.module.css";

function Appointments() {
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [treatment, setTreatment] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("pending");

  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [filterName, setFilterName] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(list);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Swal.fire("Error!", "Failed to load appointments", "error");
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        setPatients(querySnapshot.docs.map((doc) => doc.data().name));
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    const fetchTreatments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "treatments"));
        setTreatments(querySnapshot.docs.map((doc) => doc.data().name));
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };

    fetchPatients();
    fetchTreatments();
    fetchAppointments();
  }, []);

  const handleShow = () => {
    setIsEditing(false);
    setCurrentAppointmentId(null);
    setPatientName("");
    setDate("");
    setTreatment("");
    setTime("");
    setStatus("pending");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentAppointmentId(null);
    setPatientName("");
    setDate("");
    setTreatment("");
    setTime("");
    setStatus("pending");
  };

  const handleAddAppointment = async () => {
    if (!patientName || !date || !treatment || !time) {
      Swal.fire("Error!", "Please fill in all fields", "error");
      return;
    }

    try {
      if (isEditing && currentAppointmentId) {
        await updateDoc(doc(db, "appointments", currentAppointmentId), {
          patientName,
          date,
          treatment,
          time,
          status,
        });
        Swal.fire("Success!", "Appointment Updated Successfully.", "success");
      } else {
        await addDoc(collection(db, "appointments"), {
          patientName,
          date,
          treatment,
          time,
          status,
        });
        Swal.fire("Success!", "Appointment Added Successfully.", "success");
      }
      handleClose();
      await fetchAppointments();
    } catch (error) {
      console.error("Error in adding/updating appointment:", error);
      Swal.fire("Error!", "Error in adding/updating Appointment", "error");
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredTreatments = treatments.filter((t) =>
    t.toLowerCase().includes(treatmentSearch.toLowerCase())
  );

  const filteredAppointments = appointments.filter((a) =>
    a.patientName.toLowerCase().includes(filterName.toLowerCase())
  );

  const getBadge = (dateStr) => {
    const today = new Date();
    const appointmentDate = new Date(dateStr);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    const startOfNextWeek = new Date(today);
    startOfNextWeek.setDate(today.getDate() + 7 - today.getDay());
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(today.getDate() + 13 - today.getDay());

    if (isSameDay(appointmentDate, today))
      return { text: "Today", class: "bg-danger" };
    if (isSameDay(appointmentDate, tomorrow))
      return { text: "Tomorrow", class: "bg-warning" };
    if (appointmentDate >= startOfWeek && appointmentDate <= endOfWeek)
      return { text: "This Week", class: "bg-info" };
    if (appointmentDate >= startOfNextWeek && appointmentDate <= endOfNextWeek)
      return { text: "Next Week", class: "bg-primary" };
    return { text: "", class: "" };
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: newStatus });
      Swal.fire("Success!", `Appointment marked as ${newStatus}.`, "success");
      await fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error!", "Error updating status", "error");
    }
  };

  const handleEdit = (appointment) => {
    setIsEditing(true);
    setCurrentAppointmentId(appointment.id);
    setPatientName(appointment.patientName);
    setDate(appointment.date);
    setTreatment(appointment.treatment);
    setTime(appointment.time);
    setStatus(appointment.status);
    setShowModal(true);
  };

  const handleDeleteAppointment = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "appointments", id));
        Swal.fire("Deleted!", "Appointment has been deleted.", "success");
        await fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        Swal.fire("Error!", "Error deleting appointment", "error");
      }
    }
  };

  return (
    <div className="container my-4">
      {/* Search & Add Button */}
      <div className="row mb-3">
        <div className="col-12 d-flex flex-column flex-md-row gap-2">
          <input
            type="text"
            className="form-control flex-grow-1"
            placeholder="Search By Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <button className="btn btn-dark" onClick={handleShow}>
            Add Appointment
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="table-responsive">
        <table className="table table-striped caption-top appointments-table">
          <caption>Appointments</caption>
          <thead className="table-dark">
            <tr>
              <th>Schedule</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Treatment</th>
              <th className="status-column">Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => {
              const { text, class: badgeClass } = getBadge(appointment.date);
              return (
                <tr key={appointment.id}>
                  <td>
                    {text && (
                      <span className={`badge schedule-badge ${badgeClass}`}>
                        {text}
                      </span>
                    )}
                  </td>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.date}</td>
                  <td>{formatTime(appointment.time)}</td>
                  <td>{appointment.treatment}</td>
                  <td className="status-column">
                    <div className="d-flex flex-column align-items-center">
                      <span
                        className={`badge ${
                          appointment.status === "pending"
                            ? "bg-warning"
                            : appointment.status === "ongoing"
                            ? "bg-info"
                            : appointment.status === "done"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {appointment.status}
                      </span>
                      {/* Status update buttons */}
                      {appointment.status === "pending" && (
                        <div className="status-buttons">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              updateStatus(appointment.id, "ongoing")
                            }
                          >
                            Ongoing
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(appointment.id, "done")}
                          >
                            Done
                          </button>
                        </div>
                      )}
                      {appointment.status === "ongoing" && (
                        <div className="status-buttons">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(appointment.id, "done")}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>{" "}
                      &nbsp;
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(appointment)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Appointment" : "Add Appointment"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <form className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Patient"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                    <select
                      className="form-select mt-2"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    >
                      <option value="">Select Patient</option>
                      {filteredPatients.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Treatment</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Treatment"
                      value={treatmentSearch}
                      onChange={(e) => setTreatmentSearch(e.target.value)}
                    />
                    <select
                      className="form-select mt-2"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      required
                    >
                      <option value="">Select Treatment</option>
                      {filteredTreatments.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddAppointment}
                >
                  {isEditing ? "Update Appointment" : "Add Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
