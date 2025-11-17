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
import "../css/Appointments.css";
function Appointments() {
  //states
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

  const fetchPatients = async () => {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patientsList = querySnapshot.docs.map((doc) => doc.data().name);
    setPatients(patientsList);
  };

  const fetchTreatments = async () => {
    const querySnapshot = await getDocs(collection(db, "treatments"));
    const treatmentsList = querySnapshot.docs.map((doc) => doc.data().name);
    setTreatments(treatmentsList);
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    const appointmentsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort by nearest date
    appointmentsList.sort((a, b) => new Date(a.date) - new Date(b.date));
    setAppointments(appointmentsList);
  };
  //useEffect
  useEffect(() => {
    fetchPatients();
    fetchTreatments();
    fetchAppointments();
  }, []);
  //functions
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  // handle appointments
  const handleAddAppointment = async () => {
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
      fetchAppointments();
    } catch (error) {
      Swal.fire("Error!", "Error in adding/updating Appointment", "error");
      console.error("Error adding/updating appointment: ", error);
    }
  };
  const filteredPatients = patients.filter((patient) =>
    patient.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.toLowerCase().includes(treatmentSearch.toLowerCase())
  );
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(filterName.toLowerCase())
  );
  // Function to determine badge text and style
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

    if (isSameDay(appointmentDate, today)) {
      return { text: "Today", class: "badge bg-danger" };
    } else if (isSameDay(appointmentDate, tomorrow)) {
      return { text: "Tomorrow", class: "badge bg-warning" };
    } else if (appointmentDate >= startOfWeek && appointmentDate <= endOfWeek) {
      return { text: "This Week", class: "badge bg-info" };
    } else if (
      appointmentDate >= startOfNextWeek &&
      appointmentDate <= endOfNextWeek
    ) {
      return { text: "Next Week", class: "badge bg-primary" };
    } else {
      return { text: "", class: "" };
    }
  };
  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  // Function to format time
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  //update status
  const updateStatus = async (id, newStatus) => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await updateDoc(appointmentRef, { status: newStatus });
      Swal.fire("Success!", `Appointment marked as ${newStatus}.`, "success");
      fetchAppointments(); // Refresh the appointments list
    } catch (error) {
      Swal.fire("Error!", "Error updating appointment status", "error");
      console.error("Error updating appointment status: ", error);
    }
  };
  //handle edit
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
  //handle delete
  const handleDeleteAppointment = async (id) => {
    try {
      await deleteDoc(doc(db, "appointments", id));
      Swal.fire("Deleted!", "Appointment has been deleted.", "success");
      fetchAppointments(); // Refresh the appointments list
    } catch (error) {
      Swal.fire("Error!", "Error deleting appointment", "error");
      console.error("Error deleting appointment: ", error);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-12 d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search By Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{ width: "auto", flexGrow: 1 }}
          />
          <button className="btn btn-dark w-auto" onClick={handleShow}>
            Add Appointment
          </button>
        </div>
      </div>
      <div className="table-container">
        <table class="table table-responsive caption-top ">
          <caption>APPOINTMENTS</caption>
          <thead>
            <tr>
              <th scope="col">Patient Name</th>
              <th scope="col">Date</th>
              <th scope="col">Treatment</th>
              <th scope="col">Time</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => {
              const { text, class: badgeClass } = getBadge(appointment.date);
              return (
                <tr key={appointment.id}>
                  <td>{appointment.patientName}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-dashboard position-relative"
                    >
                      {appointment.date}
                      {text && (
                        <span
                          className={`badge ${badgeClass}`}
                          style={{ marginLeft: "10px" }}
                        >
                          {text}
                        </span>
                      )}
                    </button>
                  </td>
                  <td>{appointment.treatment}</td>
                  <td>{formatTime(appointment.time)}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <div className="appointmentButtonsContainer">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              updateStatus(appointment.id, "ongoing")
                            }
                          >
                            Ongoing
                          </button>{" "}
                          &nbsp;
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(appointment.id, "done")}
                          >
                            Done
                          </button>
                        </>
                      )}
                      {appointment.status === "ongoing" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => updateStatus(appointment.id, "done")}
                        >
                          Done
                        </button>
                      )}
                      &nbsp;
                      <button
                        className="btn btn-sm btn-danger"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Delete Button"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <i className="bi bi-trash bi-danger"></i>
                      </button>{" "}
                      &nbsp;
                      <button
                        className="btn btn-sm btn-success"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Edit Button"
                        onClick={() => handleEdit(appointment)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>{" "}
                      &nbsp;
                      <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="View Patient Button"
                      >
                        <i className="bi bi-eye-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Appointment" : "Add Appointment"}
                </h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Patient Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Patient"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                    <select
                      className="form-control mt-2"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    >
                      <option value="">Select Patient</option>
                      {filteredPatients.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Treatment</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Treatment"
                      value={treatmentSearch}
                      onChange={(e) => setTreatmentSearch(e.target.value)}
                    />
                    <select
                      className="form-control mt-2"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                    >
                      <option value="">Select Treatment</option>
                      {filteredTreatments.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
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
