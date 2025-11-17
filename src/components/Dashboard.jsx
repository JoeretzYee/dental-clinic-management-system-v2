import React, { useEffect, useState } from "react";
import "../css/Dashboard.module.css";
import { db, collection, getDocs } from "../firebase";
import { Link } from "react-router-dom";

function Dashboard() {
  const [patientsCount, setPatientsCount] = useState(0);
  const [treatmentsCount, setTreatmentsCount] = useState(0);
  const [appointmentsTodayCount, setAppointmentsTodayCount] = useState(0);
  const [appointmentsTomorrowCount, setAppointmentsTomorrowCount] = useState(0);
  const [appointmentsThisWeekCount, setAppointmentsThisWeekCount] = useState(0);
  const [appointmentsUpcomingCount, setAppointmentsUpcomingCount] = useState(0);

  useEffect(() => {
    const fetchPatientsCount = async () => {
      const querySnapshot = await getDocs(collection(db, "patients"));
      setPatientsCount(querySnapshot.size);
    };

    const fetchTreatmentsCount = async () => {
      const querySnapshot = await getDocs(collection(db, "treatments"));
      setTreatmentsCount(querySnapshot.size);
    };

    const fetchAppointmentsCount = async () => {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const appointments = querySnapshot.docs.map((doc) => doc.data());

      const today = new Date();
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

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const isWithinWeek = (date) => date >= startOfWeek && date <= endOfWeek;
      const isWithinNextWeek = (date) =>
        date >= startOfNextWeek && date <= endOfNextWeek;

      setAppointmentsTodayCount(
        appointments.filter((a) => isSameDay(new Date(a.date), today)).length
      );
      setAppointmentsTomorrowCount(
        appointments.filter((a) => isSameDay(new Date(a.date), tomorrow)).length
      );
      setAppointmentsThisWeekCount(
        appointments.filter((a) => isWithinWeek(new Date(a.date))).length
      );
      setAppointmentsUpcomingCount(
        appointments.filter((a) => isWithinNextWeek(new Date(a.date))).length
      );
    };

    fetchPatientsCount();
    fetchTreatmentsCount();
    fetchAppointmentsCount();
  }, []);

  return (
    <div className="container my-4">
      {/* Appointments Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-dark text-light">
            <div className="card-body text-center">
              <div className="h1 mb-3">
                <i className="bi bi-list-task"></i>
              </div>
              <h3 className="card-title mb-3">Appointments</h3>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Link
                  to="/appointments"
                  className="btn btn-primary position-relative"
                >
                  Today
                  <span className="badge rounded-pill bg-danger ms-2">
                    {appointmentsTodayCount}
                  </span>
                </Link>
                <Link
                  to="/appointments"
                  className="btn btn-primary position-relative"
                >
                  Tomorrow
                  <span className="badge rounded-pill bg-danger ms-2">
                    {appointmentsTomorrowCount}
                  </span>
                </Link>
                <Link
                  to="/appointments"
                  className="btn btn-primary position-relative"
                >
                  This Week
                  <span className="badge rounded-pill bg-danger ms-2">
                    {appointmentsThisWeekCount}
                  </span>
                </Link>
                <Link
                  to="/appointments"
                  className="btn btn-primary position-relative"
                >
                  Next Week
                  <span className="badge rounded-pill bg-danger ms-2">
                    {appointmentsUpcomingCount}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients & Treatments Cards */}
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <Link to="/patients" className="text-decoration-none">
            <div className="card bg-dark text-light h-100 text-center">
              <div className="card-body">
                <div className="h1 mb-3">
                  <i className="bi bi-laptop"></i>
                </div>
                <h3 className="card-title mb-3">Patients</h3>
                <p className="card-text display-6">{patientsCount}</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6">
          <Link to="/treatments" className="text-decoration-none">
            <div className="card bg-dark text-light h-100 text-center">
              <div className="card-body">
                <div className="h1 mb-3">
                  <i className="bi bi-people"></i>
                </div>
                <h3 className="card-title mb-3">Treatments</h3>
                <p className="card-text display-6">{treatmentsCount}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
