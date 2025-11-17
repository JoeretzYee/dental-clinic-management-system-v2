import React from "react";
import { Route, Routes } from "react-router-dom";
import Appointments from "./Appointments";
import Dashboard from "./Dashboard";
import Patients from "./Patients";
import Payment from "./Payment";
import Treatments from "./Treatments";
import PatientDetails from "./PatientDetails";

function Home() {
  return (
    <div className="main p-3">
      <div className="text-center">
        <h1>Dental Clinic Management System</h1>
        <hr />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
