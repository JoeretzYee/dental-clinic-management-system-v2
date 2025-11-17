import React, { useEffect, useState } from "react";
import "../css/Dashboard.css";
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
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      // Determine the start and end of the current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

      // Determine the start and end of next week
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(today.getDate() + 7 - today.getDay());
      const endOfNextWeek = new Date(today);
      endOfNextWeek.setDate(today.getDate() + 13 - today.getDay());

      const isSameDay = (date1, date2) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();

      const isWithinWeek = (date) => date >= startOfWeek && date <= endOfWeek;

      const isWithinNextWeek = (date) =>
        date >= startOfNextWeek && date <= endOfNextWeek;

      const appointmentsToday = appointments.filter((appointment) =>
        isSameDay(new Date(appointment.date), today)
      );

      const appointmentsTomorrow = appointments.filter((appointment) =>
        isSameDay(new Date(appointment.date), tomorrow)
      );

      const appointmentsThisWeek = appointments.filter((appointment) =>
        isWithinWeek(new Date(appointment.date))
      );

      const appointmentsNextWeek = appointments.filter((appointment) =>
        isWithinNextWeek(new Date(appointment.date))
      );

      setAppointmentsTodayCount(appointmentsToday.length);
      setAppointmentsTomorrowCount(appointmentsTomorrow.length);
      setAppointmentsThisWeekCount(appointmentsThisWeek.length);
      setAppointmentsUpcomingCount(appointmentsNextWeek.length);
    };

    fetchPatientsCount();
    fetchTreatmentsCount();
    fetchAppointmentsCount();
  }, []);

  return (
    <div>
      <div className="row">
        <Link to="/appointments">
          <div className="card bg-dark text-light">
            <div className="card-body text-center appointments-summary">
              <div className="h1 mb-3">
                <i className="bi bi-list-task"></i>
              </div>
              <h3 className="card-title mb-3">Appointments</h3>
              <div className="appointments-buttons">
                <Link to="/appointments">
                  <button
                    type="button"
                    className="btn btn-dashboard btn-primary position-relative"
                  >
                    Appointments Today
                    <span className="badge rounded-pill bg-danger">
                      {appointmentsTodayCount}
                    </span>
                  </button>
                </Link>
                <Link to="/appointments">
                  <button
                    type="button"
                    className="btn btn-dashboard btn-primary position-relative"
                  >
                    Appointments Tomorrow
                    <span className="badge rounded-pill bg-danger">
                      {appointmentsTomorrowCount}
                    </span>
                  </button>
                </Link>
                <Link to="/appointments">
                  <button
                    type="button"
                    className="btn btn-dashboard btn-primary position-relative"
                  >
                    Appointments This Week
                    <span className="badge rounded-pill bg-danger">
                      {appointmentsThisWeekCount}
                    </span>
                  </button>
                </Link>
                <Link to="/appointments">
                  <button
                    type="button"
                    className="btn btn-dashboard btn-primary position-relative"
                  >
                    Next Week Appointments
                    <span className="badge rounded-pill bg-danger">
                      {appointmentsUpcomingCount}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <br />
      <div className="row g-4">
        <div className="col-md">
          <Link to="/patients">
            <div className="card bg-dark text-light">
              <div className="card-body text-center">
                <div className="h1 mb-3">
                  <i className="bi bi-laptop"></i>
                </div>
                <h3 className="card-title mb-3">Patients</h3>
                <p className="card-text">{patientsCount}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md">
          <Link to="/treatments">
            <div className="card bg-dark text-light">
              <div className="card-body text-center">
                <div className="h1 mb-3">
                  <i className="bi bi-people"></i>
                </div>
                <h3 className="card-title mb-3">Treatments</h3>
                <p className="card-text">{treatmentsCount}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
